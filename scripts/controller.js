// Listen for drag and drop
document.addEventListener('drop',      dropped,        false);
document.addEventListener('dragover',  dragOver, false);
document.addEventListener('dragleave', dragLeave, false);

var el = document.querySelector('.playground');
var mySVG;

function dragOver (event) {
  event.preventDefault();
  el.classList.add('droppin');
}

function dragLeave (event) {
  event.preventDefault();
  el.classList.remove('droppin');
}

function dropped (event) {
  event.preventDefault();
  var data = event.dataTransfer;
  if (!data || !data.files || !data.files[0]) {
    return;
  }

  console.info(data.files[0]);

  var file = new FileReader();
  file.addEventListener('load', function () {
    console.log(file.result);
    var encodedData = file.result;
    encodedData = encodedData.substr(encodedData.indexOf('base64,')+7);
    var data = atob(encodedData);

    var wrapDom = document.createElement('div');
    wrapDom.innerHTML = data;
    mySVG = wrapDom.childNodes[0];
    el.appendChild(mySVG)
  }, false);
  uploadedFileName = data.files[0].name;
  file.readAsDataURL(data.files[0]);
}
