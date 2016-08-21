function showError(e) {
  killLove();
  $('#errorToast')
    .stop()
    .css({"top":-100})
    .show()
    .html(e)
    .animate({"top":10});
}

function hideError(e) {
  $('#errorToast')
   .animate({"top":-100});
}

function killError() {
  $('#errorToast')
    .stop()
    .animate({"top":-100}, 200);
}

function toastError(e) {
  showError(e);
  setTimeout(function() {
    hideError();
  }, 2500);
}

function showLove(e) {
  killError();
  $('#loveToast')
    .stop()
    .css({"top":-100})
    .show()
    .html(e)
    .animate({"top":10});
}

function hideLove(e) {
  $('#loveToast')
   .animate({"top":-100});
}

function killLove() {
  $('#loveToast')
    .stop()
    .animate({"top":-100}, 200);
}

function toastLove(e) {
  showLove(e);
  setTimeout(function() {
    hideLove();
  }, 2500);
}
