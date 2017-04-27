
// $.get(chrome.extension.getURL("sam.html"), {}, function(data) {$('body').append(data);}, 'html');
// chrome.extension.sendRequest({}, function(response) {});

var lower_case = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ]
var upper_case = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ]
var punctuation= ['!', '#', '$', '%', '&', '(', ')', '*', '+', ',', '-', '.', '/', '[', ']', '?', '_', '-', '@', '{', '}', '^', '=', ';' ]
var digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ]
var background_page = chrome.extension.getBackgroundPage();

// Sample vault data: 

// var sample_vault_data = [
// { "username" : "-Nnz5$]0", "password" : "nr70jR38a6@b!8%/", "domain" : 'facebook' },
// { "username" : "[D!t4Eae", "password" : "l8i2G20dgx2f0/Gb", "domain" : 'google' },
// { "username" : "oo1Q4)U6", "password" : "60/cHQI2+65-OY6(", "domain" : 'twitter' }
// ];


// Fired upon user clicking on login button, if they are not already logged in.
function login() {
  // background_page.save_vault(sample_vault_data, function(){});
  var username = document.getElementById('sam_username').value;
  var pw = document.getElementById('sam_password').value;
  background_page.login(username, pw);
  background_page.get_vault(function(data){
    populate_table('sam_pws_table', data);
  });
}

// Generate new username and password pair.
// Will be updated to include options for different groups and lengths
// TODO 
function generate_creds() {
  document.getElementById('sam_new_creds').hidden = false;
  var username_box = document.getElementById('sam_new_username');
  var pw_box = document.getElementById('sam_new_password');
  var name = gen_rand_seq(8, true, true);
  var pw = gen_rand_seq(16, true, true);
  username_box.innerHTML = name;
  pw_box.innerHTML = pw;
}

// Generating random sequence from the character groups
// Will be updated to use inclusion flags
// TODO
function gen_rand_seq(limit, include_punc, include_dig) {
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
    r = gen_rand_seq(limit, include_punc, include_dig);
  }
  return r;
}

// Print out usernames and passwords as a table. Add edit button. Instead of edit how about add custom pw?
// TODO
function populate_table(table_name, data) {
  document.getElementById('sam_login_div').hidden = true;
  document.getElementById('sam_pws_div').hidden = false;
  document.getElementById(table_name).hidden = false;

  var t = new Array(), j = -1;
  t[++j] = '<tr><th>Domain</th><th>User Name</th><th>Password</th><th style="color:red">Remove</th></tr>';

  for (var i = 0; i < data.length; i++) {
    t[++j] ='<tr><td>';
    t[++j] = data[i]['domain'];
    t[++j] = '</td><td>';
    t[++j] = data[i]['username'];
    t[++j] = '<button id="table_username'+i+'"style="float: right;" value="'+data[i]['username']+'">Copy</button>';
    t[++j] = '</td><td>';
    t[++j] = data[i]['password'];
    t[++j] = '<button id="table_password'+i+'"style="float: right;" value="'+data[i]['password']+'">Copy</button>';
    t[++j] = '</td><td>';
    t[++j] = '<button id="table_remove'+i+'"style="float: right; color:red " value="'+data[i]['domain']+'">Remove</button>';
    t[++j] = '</td></tr>';
  }
  $('#sam_pws_table').html(t.join(''));
  for (var i = 0, k = 0; i < data.length; i++) {
    document.getElementById('table_username'+i).addEventListener('click', function() {
      copy_to_clipboard(this.value);
    }, false);
    document.getElementById('table_password'+i).addEventListener('click', function() {
      copy_to_clipboard(this.value);
    }, false);
    document.getElementById('table_remove'+i).addEventListener('click', function() {
      remove_domain(this.value);
    }, false);
  }
}

function remove_domain(domain) {
  background_page.remove_from_vault(domain, function(new_vault) {
    populate_table('sam_pws_table', new_vault);
  });
}

// Copy the given text to the clipboard
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

// Save the generated username and password (assumption: if copied, it is used) while copying username to clipboard
function copy_username() {
  copy_to_clipboard(document.getElementById('sam_new_username').innerHTML);
  var un = document.getElementById('sam_new_username').innerHTML;
  var pw = document.getElementById('sam_new_password').innerHTML;
  chrome.tabs.getSelected(null, function (tab) {
    var url = new URL(tab.url);
    var domain = url.hostname;
    var data = { 'domain' : domain, 'username' : un, 'password' : pw };
    background_page.add_to_vault(data, function(data){
      populate_table('sam_pws_table', data);
    });
  });
}

// Save the generated username and password (assumption: if copied, it is used) while copying the password to clipboard
function copy_password() {
  copy_to_clipboard(document.getElementById('sam_new_password').innerHTML);
  var un = document.getElementById('sam_new_username').innerHTML;
  var pw = document.getElementById('sam_new_password').innerHTML;
  chrome.tabs.getSelected(null, function (tab) {
    var url = new URL(tab.url);
    var domain = url.hostname;
    var data = { 'domain' : domain, 'username' : un, 'password' : pw };
    background_page.add_to_vault(data, function(data){
      populate_table('sam_pws_table', data);
    });
  });
}

// Add event listeners and button onclick functions to the HTML elements.
document.addEventListener('DOMContentLoaded', function() {
  $(document).ready(function(){
    background_page.check_login(function(cookie_value){
      if(cookie_value) {
        background_page.get_vault(function(data) {
          populate_table('sam_pws_table', data );
        });
      }
      else {
        console.log('not logged in');
      }
    });
    
    document.getElementById('sam_login').onclick = login;
    document.getElementById('sam_gen_data').onclick = generate_creds;
    document.getElementById('sam_username_copy').onclick = copy_username;
    document.getElementById('sam_password_copy').onclick = copy_password;
  });
});


