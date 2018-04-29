"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//Author: Daniel Krajnak
var Typewriter = function () {
    /**
    Makes it look like the supplied texts are being typed into the element.

    The typewriter performs operations works asynchronously.  Think of each method as adding
    a number of operations to a "delay sequence" or queue.  Therefore, please DON'T code things like:

    while(true){
        typewriter.typeNextText()
        typeWriter.deleteAllCharacters();
    }

    The delay sequence would get HUGE.  Not good. Use typewriter.play().
    If you want to get your hands dirty and monitor the delaySequence, it's provided
    as a get-only property.

    Params:
        texts = an array of strings to be typed.
        el = the html element in which the texts should be typed.
        errorProbability? = the probability that a given character will be mistyped.

    Properties:
        isTyping
            Returns a boolean.  True if the typewriter is currently typing, false if otherwise.

        delaySequence
            Returns the a deep copy of the current delaysequence: a queue containing all operations and their delays.

    Public methods:
        Just a note about delays:
            DelayBase = number of milliseconds, on average, typing a character, deleting a character, or pausing will take
            DelayVariance = number of milliseconds the delay will vary randomly around the base.  Must be <= base.

        pause(delayBase?, delayVariance?)
            Adds a pause for a specified number of milliseconds.

        deleteCharacter(delayBase?, delayVariance?)
            Deletes a character from the displayed text.  If there's no characters left, it won't do anything
            (you're welcome).

        deleteCharacters(numCharacters, delayBase?, delayVariance?)
            Deletes the given numberOfCharacters.  If numberOfCharacters is longer than the typed text,
            this method will just delete the typed text (you're welcome).

        deleteAllCharacters(delayBase?, delayVariance?)
            Deletes all currently display characters.

        play(playParamObject?)
            Plays through the texts—types next text, pauses, deletes it, pauses, repeat.

        stop(immediately?)
            Stops the typewriter from playing.  If immediately is false or not supplied, the typewriter will
            finish typing and deleting the current text.  If immediately is true, it will stop immediately.

        typeCharacter(character?, delayBase?, delayVariance?)
            Types the next character with a delay that varies randomly within the given variance
            around the base delay.  If no character is supplied, types the next character in texts.
            Returns false if there's not a character to be typed, otherwise returns true.

        typeNextText(delayBase?, delayVariance?)
            Types the next full text.  Note: does not delete the previous text first.

    Everything else is private.  No touching.

    */

    function Typewriter(texts, el) {
        var errorProbability = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : .03;
        _classCallCheck(this, Typewriter);

        this._texts = texts;
        this._el = el;

        //Probability that a character will be mistyped
        this.errorProbability = errorProbability;

        //Current text displayed in the element.
        this._currentText = el.innerHTML;

        //Used to manage delays in adding characters.
        this._delaySequence = [];
        this._delaySequenceRunning = false;

        //Length of currentText after all delays in the delay sequence run.
        this._lengthAfterDelay = 0;

        //Used in play() to rotate through texts
        this._play = false;
        this._stopImmediately = false;

        //Which text in this._texts we're on.
        this._textIndex = 0;

        //Text to type next (used for play and typeNextText)
        this._textToType = this._texts[0].split("");

        //Constants
        this._DEFAULT_TYPE_DELAY_BASE = 150;
        this._DEFAULT_TYPE_DELAY_VARIANCE = 50;
        this._DEFAULT_DELETE_DELAY_BASE = 80;
        this._DEFAULT_DELETE_DELAY_VARIANCE = 10;
        this._DEFAULT_PAUSE_AMOUNT = 2000;

        this._playParamaters;
    }

    _createClass(Typewriter, [{
        key: "pause",


        //Public Methods:
        value: function pause() {
            var pauseAmount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._DEFAULT_PAUSE_AMOUNT;
            var variance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            this._delay(function () {}, pauseAmount, variance);
            return this;
        }
    }, {
        key: "deleteAllCharacters",
        value: function deleteAllCharacters() {
            var delayBase = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._DEFAULT_DELETE_DELAY_BASE;
            var delayVariance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._DEFAULT_DELETE_DELAY_VARIANCE;

            var length = this._lengthAfterDelay;
            for (var i = 0; i < length; i++) {
                this.deleteCharacter(delayBase, delayVariance);
            }
            return this;
        }
    }, {
        key: "deleteCharacter",
        value: function deleteCharacter() {
            var _this = this;

            var delayBase = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._DEFAULT_DELETE_DELAY_BASE;
            var delayVariance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._DEFAULT_DELETE_DELAY_VARIANCE;

            this._lengthAfterDelay = Math.max(this._lengthAfterDelay - 1, 0);
            this._delay(function () {
                if (_this._currentText.length == 0) return false;
                _this._currentText = _this._currentText.substr(0, _this._currentText.length - 1);
                _this._displayCurrentText();
            }, delayBase, delayVariance);
            return this;
        }
    }, {
        key: "deleteCharacters",
        value: function deleteCharacters(numCharacters) {
            var delayBase = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._DEFAULT_DELETE_DELAY_BASE;
            var delayVariance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this._DEFAULT_DELETE_DELAY_VARIANCE;

            for (var i = 0; i < numCharacters; i++) {
                this.deleteCharacter(delayBase, delayVariance);
            }
            return this;
        }
    }, {
        key: "play",
        value: function play() {
            var pause = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._DEFAULT_PAUSE_AMOUNT;
            var pauseVariance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var typeDelayBase = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this._DEFAULT_TYPE_DELAY_BASE;
            var typeDelayVariance = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this._DEFAULT_TYPE_DELAY_VARIANCE;
            var deleteDelayBase = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : this._DEFAULT_DELETE_DELAY_BASE;
            var deleteDelayVariance = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : this._DEFAULT_DELETE_DELAY_VARIANCE;

            this._playParams = {
                pause: pause,
                pauseVariance: pauseVariance,
                typeDelayBase: typeDelayBase,
                typeDelayVariance: typeDelayVariance,
                deleteDelayBase: deleteDelayBase,
                deleteDelayVariance: deleteDelayVariance
            };
            this._play = true;
            if (!this._delaySequenceRunning) {
                this._executeNextDelay();
            }
            return this;
        }
    }, {
        key: "stop",
        value: function stop() {
            var immediately = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            this._play = false;
            if (immediately) {
                this._stopImmediately = true;
                this._delaySequenceRunning = false; //Added here so that isTyping will update immediately.
            }
            return this;
        }
    }, {
        key: "typeCharacter",
        value: function typeCharacter() {
            var character = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            var _this2 = this;

            var delayBase = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._DEFAULT_TYPE_DELAY_BASE;
            var delayVariance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this._DEFAULT_TYPE_DELAY_VARIANCE;

            if (character == null) {
                if (this._textToType.length > 0) {
                    character = this._textToType.unshift();
                } else {
                    return false;
                }
            }
            this._lengthAfterDelay++;

            //Maybe make a mistake
            if (Math.random() <= this.errorProbability) {
                var mistake = this._getMistakeCharacter(character);
                this._lengthAfterDelay++;
                this._delay(function () {
                    _this2._currentText = _this2._currentText.concat(mistake);
                    _this2._displayCurrentText();
                });
                this.pause(200, 100);
                this.deleteCharacters(1);
            }
            this._delay(function () {
                _this2._currentText = _this2._currentText.concat(character);
                _this2._displayCurrentText();
            }, delayBase, delayVariance);
            return this;
        }
    }, {
        key: "typeNextText",
        value: function typeNextText() {
            var _this3 = this;

            var delayBase = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._DEFAULT_TYPE_DELAY_BASE;
            var delayVariance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._DEFAULT_TYPE_DELAY_VARIANCE;

            this._textToType = this._texts[this._textIndex].split("");
            this._textIndex = (this._textIndex + 1) % this._texts.length;
            this._textToType.forEach(function (character) {
                _this3.typeCharacter(character, delayBase, delayVariance);
            });
            return this;
        }

        /*      Private Members     */

    }, {
        key: "_delay",
        value: function _delay(afterDelay, delayBase) {
            var delayVariance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            this._delaySequence.push({
                function: afterDelay,
                delay: delayBase + Math.random() * delayVariance - delayVariance / 2
            });
            if (!this._delaySequenceRunning) this._executeNextDelay();
        }
    }, {
        key: "_displayCurrentText",
        value: function _displayCurrentText() {
            this._el.innerHTML = this._currentText;
        }
    }, {
        key: "_executeNextDelay",
        value: function _executeNextDelay() {
            var _this4 = this;

            if (this._stopImmediately) {
                this._stopImmediately = false;
            } else {
                this._delaySequenceRunning = true;
                if (this._delaySequence.length > 0) {
                    var nextDelay = this._delaySequence.shift();
                    setTimeout(function () {
                        nextDelay.function();
                        window.requestAnimationFrame(function(){_this4._executeNextDelay()});
                    }, nextDelay.delay);
                } else {
                    if (this._play) {
                        this.typeNextText(this._playParams.typeDelayBase, this._playParams.typeDelayVariance);
                        this.pause(this._playParams.pause, this._playParams.pauseVariance);
                        this.deleteAllCharacters(this._playParams.deleteDelayBase, this._playParams.deleteDelayVariance);
                        this.pause(this._playParams.pause, this._playParams.pauseVariance);
                        this._executeNextDelay();
                    } else {
                        this._delaySequenceRunning = false;
                    }
                }
            }
        }
    }, {
        key: "_getMistakeCharacter",
        value: function _getMistakeCharacter(character) {
            var keyboard = ['qwertyuiop[', 'asdfghjkl;', 'zxcvbnm,'];
            var uppercase = character.toUpperCase() == character;
            var isLetter = 'abcdefghijklmnopqrstuvwxyz'.indexOf(character.toLowerCase()) != -1;

            if (isLetter) {
                /*With a 90% chance, if the character is uppercase, make the
                mistake character the lowercase version of the uppercase.
                If it's lowercase, reverse the probability.*/
                var chanceOfCaseMistake = uppercase ? .9 : .1;
                if (Math.random() <= chanceOfCaseMistake) {
                    return uppercase ? character.toLowerCase() : character.toUpperCase();
                }
                //Otherwise make a big finger mistake
                for (var i = 0; i < keyboard.length; i++) {
                    var index = keyboard[i].indexOf(character.toLowerCase());
                    if (index != -1) {
                        switch (index) {
                            case 0:
                                return keyboard[i][1];

                            case keyboard[i].length - 1:
                                return keyboard[i].length - 2;

                            default:
                                return Math.random() <= .5 ? keyboard[i][index - 1] : keyboard[i][index + 1];
                        }
                    }
                }
            }

            //Handle special characters
            //TODO: this doesn't handle ' ' (space) very well... or at all.
            var specialCharacters = ['1234567890-=', 'p[]\\', 'l;\'', 'm,./'];
            var specialCharactersShift = ['!@#$%^&*()_+', 'P{}|', 'L:\"', 'M<>?'];

            for (var _i = 0; _i < specialCharactersShift.length; _i++) {
                var shiftedIndex = specialCharactersShift[_i].indexOf(character);
                if (shiftedIndex -= -1) {
                    //It's shifted, so with a 90% chance, make a shift mistake.  Otherwise, big finger mistake.
                    if (Math.random() <= .9) {
                        return specialCharacters[_i][shiftedIndex];
                    }
                    switch (shiftedIndex) {
                        case 0:
                            return specialCharactersShift[_i][1];

                        case specialCharactersShift[_i].length - 1:
                            return specialCharactersShift[_i][specialCharactersShift[_i].length - 2];

                        default:
                            return Math.random() <= .5 ? specialCharactersShift[_i][shiftedIndex - 1] : specialCharactersShift[_i][shiftedIndex + 1];
                    }
                }
            }

            for (var _i2 = 0; _i2 < specialCharacters.length; _i2++) {
                var _index = specialCharactersShift[_i2].indexOf(character);
                if (_index -= -1) {
                    //It's not shifted, so with a 10% chance, make a shift mistake.  Otherwise, big finger mistake.
                    if (Math.random() <= .1) {
                        return specialCharactersShift[_i2][_index];
                    }
                    switch (_index) {
                        case 0:
                            return specialCharactersShift[_i2][1];

                        case specialCharactersShift[_i2].length - 1:
                            return specialCharactersShift[_i2][specialCharactersShift[_i2].length - 2];

                        default:
                            return Math.random() <= .5 ? specialCharactersShift[_i2][_index - 1] : specialCharactersShift[_i2][_index + 1];
                    }
                }
            }
            //As a default, just return the given character.
            return character;
        }
    }, {
        key: "isTyping",
        get: function get() {
            return this._delaySequenceRunning;
        }
    }, {
        key: "delaySequence",
        get: function get() {
            /*Just a fun little note:
            No need for a lock here because, though Javascript is asynchronous, it's based on
            an event loop model which guarantees this function won't be interrupted while it's
            coping the delay sequence */
            var copy = [];
            this._delaySequence.forEach(function (delay) {
                return copy.push(Object.assign({}, delay));
            });
            return copy;
        }
    }]);

    return Typewriter;
}();
