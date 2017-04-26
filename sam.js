
// $.get(chrome.extension.getURL("sam.html"), {}, function(data) {$('body').append(data);}, 'html');
// chrome.extension.sendRequest({}, function(response) {});

var lower_case = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
var upper_case = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
var punctuation= ['!', '#', '$', '%', '&', '(', ')', '*', '+', ',', '-', '.', '/', '[', ']', '?', '_', '-', '@']
var digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
var background_page = chrome.extension.getBackgroundPage();
console.log(background_page);

function send_request(type, url, data, success_callback, error_callback) {
  $.ajax({
    type : type,
    url : url,
    dataType: "text",
    contentType: "application/json; charset=utf-8",
    data : JSON.stringify(data),

    success: function(msg){
      success_callback(msg);
    },

    error: function (textStatus, errorThrown) {
      error_callback(textStatus, errorThrown);
    }
  }); 
}

function login() {
  var username = document.getElementById('sam_username').value;
  var pw = document.getElementById('sam_password').value;
  var url = 'TBD';
  var data = {'creds':[
  { 'username' : "-Nnz5$]0", "pw" : "nr70jR38a6@b!8%/", 'domain' : 'facebook' },
  { 'username' : "[D!t4Eae", "pw" : "l8i2G20dgx2f0/Gb", 'domain' : 'google' },
  { 'username' : "oo1Q4)U6", "pw" : "60/cHQI2+65-OY6(", 'domain' : 'twitter' }
  ]};
  // send_request('POST', 'http://nyu-devops-s17-inventory.mybluemix.net/inventory/products', 
  //   JSON.stringify({ 'username': 'user', 'password': 'pass', }), 
  //   function(data) {
  //     populate_table('sam_pws_table', data);
  //   },
  //   function(status, error) { 
  //     console.log(error);
      
  //     // background_page.save_vault(data, function(){
        
  //     // });
      
  //     background_page.get_vault(function(data){
  //       populate_table('sam_pws_table', data);
  //     });
  //     // document.getElementById('sam_err_msg').hidden = false;
  //   }
  //   );
  // background_page.save_vault(data, function(){});

  background_page.get_vault(function(data){
    populate_table('sam_pws_table', data);
  });
}

function generate_creds() {
  document.getElementById('sam_new_creds').hidden = false;
  var username_box = document.getElementById('sam_new_username');
  var pw_box = document.getElementById('sam_new_password');
  var name = gen_rand_seq(8);
  var pw = gen_rand_seq(16);
  username_box.innerHTML = name;
  pw_box.innerHTML = pw;
}

function gen_rand_seq(limit) {
  var r = "";
  // Populate the string
  for (var i = 0; i < limit; i++) {
    switch(Math.floor(Math.random()*4)){
      case 0:
      r += upper_case[Math.floor(Math.random()*upper_case.length)];
      break;
      case 1:
      r += punctuation[Math.floor(Math.random()*punctuation.length)];
      break;
      case 2:
      r += digits[Math.floor(Math.random()*digits.length)];
      break;
      default:
      r += lower_case[Math.floor(Math.random()*lower_case.length)];
      break;

    }
  }
  // Make sure it has at least 1 of each category
  var low = false, up = false, punc = false, dig = false;
  for (var i = 0; i < lower_case.length; i++) {
    if(r.includes(lower_case[i])){
      low = true;
      break;
    }
  }
  for (var i = 0; i < upper_case.length; i++) {
    if(r.includes(upper_case[i])){
      up = true;
      break;
    }
  }
  for (var i = 0; i < punctuation.length; i++) {
    if(r.includes(punctuation[i])){
      punc = true;
      break;
    }
  }
  for (var i = 0; i < digits.length; i++) {
    if(r.includes(digits[i])){
      dig = true;
      break;
    }
  }
  // Only pass if all exist
  var is_valid = low && up && punc && dig;
  if(!is_valid){
    r = gen_rand_seq(limit);
  }
  return r;
}

function populate_table(table_name, data) {
  document.getElementById('sam_login_div').hidden = true;
  document.getElementById('sam_pws_div').hidden = false;
  var table = document.getElementById(table_name)
  table.hidden = false;

  var list = data['creds'];
  var t = new Array(), j = -1;
  t[++j] = '<tr><th>Domain</th><th>User Name</th><th>Password</th></tr>';

  for (var i = 0; i < list.length; i++) {
    t[++j] ='<tr><td>';
    t[++j] = list[i]['domain'];
    t[++j] = '</td><td>';
    t[++j] = list[i]['username'];
    t[++j] = '<button id="table_username'+i+'"style="float: right;" value="'+list[i]['username']+'">Copy</button>';
    t[++j] = '</td><td>';
    t[++j] = list[i]['pw'];
    t[++j] = '<button id="table_password'+i+'"style="float: right;" value="'+list[i]['pw']+'">Copy</button>';
    t[++j] = '</td></tr>';
  }
  $('#sam_pws_table').html(t.join(''));
  for (var i = 0, k = 0; i < list.length; i++) {
    document.getElementById('table_username'+i).addEventListener('click', function() {
      copy_to_clipboard(this.value);
    }, false);
    document.getElementById('table_password'+i).addEventListener('click', function() {
      copy_to_clipboard(this.value);
    }, false);
  }
}

function copy_to_clipboard(text) {
  const input = document.createElement('input');
  input.style.position = 'fixed';
  input.style.opacity = 0;
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
};

function copy_username() {
  copy_to_clipboard(document.getElementById('sam_new_username').innerHTML);
  var un = document.getElementById('sam_new_username').innerHTML;
  var pw = document.getElementById('sam_new_password').innerHTML;
  chrome.tabs.getSelected(null, function (tab) {
    var url = new URL(tab.url);
    var domain = url.hostname;
    var data = { 'domain' : domain, 'username' : un, 'pw' : pw };
    background_page.add_to_vault(data, function(data){
      populate_table('sam_pws_table', data);
    });
  })
}

function copy_password() {
  copy_to_clipboard(document.getElementById('sam_new_password').innerHTML);
  var un = document.getElementById('sam_new_username').innerHTML;
  var pw = document.getElementById('sam_new_password').innerHTML;
  chrome.tabs.getSelected(null, function (tab) {
    var url = new URL(tab.url);
    var domain = url.hostname;
    var data = { 'domain' : domain, 'username' : un, 'pw' : pw };
    background_page.add_to_vault(data);
  })
}

document.addEventListener('DOMContentLoaded', function() {
  $(document).ready(function(){
    document.getElementById('sam_login').onclick = login;
    document.getElementById('sam_gen_data').onclick = generate_creds;
    document.getElementById('sam_username_copy').onclick = copy_username;
    document.getElementById('sam_password_copy').onclick = copy_password;
  });
});


