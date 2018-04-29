jQuery(document).ready(function ($) {
  var textToType = [' birthplace.', ' legacy.', ' culture.', ' history.'];
	var typeWriter = new Typewriter(textToType, document.getElementById('typedText'), 0);
	typeWriter.play();
}
