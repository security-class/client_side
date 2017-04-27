
// chrome.extension.onRequest.addListener(
// 	function(request, sender, sendResponse) {
// 		chrome.pageAction.show(sender.tab.id);
// 		sendResponse({});
// 	}
// );

// For clearing out the local storage
function clear_storage() {
    chrome.storage.local.clear(function() {});
} 

var sam_cookie_url = "http://www.example.com/";
var url_base_auth = 'https://pcs-sam-auth.mybluemix.net/';
var url_base_vault = 'https://pcs-sam-vault.mybluemix.net/';
var token = ' ';
var uid = -1;

// Check if the user logged in. Currently only checks if the cookie exists, later will send request to server for making sure the token is still valid.
// TODO
// Post for getting auth: auth/token/
// Get user vault: /vault/users/<id>
// 

function send_login_request(type, url, data, success_callback, error_callback) {
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

// Helper post function
function send_request(type, url, data, success_callback, error_callback) {
  $.ajax({
    type : type,
    url : url,
    dataType: "text",
    contentType: "application/json; charset=utf-8",
    headers: {
      "Authorization": token
    },
    data : JSON.stringify(data),

    success: function(msg){
      success_callback(msg);
    },

    error: function (textStatus, errorThrown) {
      error_callback(JSON.stringify(textStatus), errorThrown);
    }
  }); 
}

function login(username, password) {
    send_request("POST", url_base_auth+"auth/token", { "email": username, "password": password}, 
    function(data){
        token = data;
        uid = get_id_from_token(token);
        set_login(token);
    },
    function(status, error){
        console.log('Error logging in: ' + status + ' ' + error);
    });
}

function check_login(call_back) {
    chrome.cookies.get({"url": sam_cookie_url, "name": "sam"}, function(cookie) {
        if (call_back && cookie) {
            call_back(cookie.value);
            console.log(cookie.value);
        }
        else {
            call_back();
        }
    } );
}

// If user logs in, the token wil be written to cookies. Default option is hold cookie for the current session, and thats what we need.
function set_login(token) {
    chrome.cookies.set({"name": "sam", "url": sam_cookie_url, "value": token}, function (cookie){
        console.log("Cookie set!");
    })
}

// Save the vault to the chrome storage.
function save_vault(data, call_back) {
    // Make sure data exists.
    if (!data) {
        message('Error: No value specified');
        return;
    }
    // Save it using the Chrome extension storage API.
    data = encrypt(data);
    chrome.storage.local.set({'sam_vault': data}, call_back() );
}

// Get the vault from local storage.
function get_vault(call_back) {
    chrome.storage.local.get('sam_vault', function (data) {
        call_back(JSON.parse(decrypt(data['sam_vault'])));
    }) 
}

// Pass phrase. Will be altered later.
// TODO
var x = "(-5m5N,65#j&83n,EP2Z5b[!";

function encrypt(data) {
    if (data)
        return CryptoJS.AES.encrypt(JSON.stringify(data), x).toString();
}

function decrypt(data) {
    if(data)
        return CryptoJS.AES.decrypt(data, x).toString(CryptoJS.enc.Utf8);
}

function add_to_vault(data, call_back) {
    get_vault(function(curr_vault) {
        var found = false;
        // Update a domain
        for(var i = 0; i < curr_vault.length; i++) {
            if(curr_vault[i]['domain'] == data['domain']){
                if (confirm("This will overwrite the username \""+curr_vault[i]['username']+"\" and password for "+data['domain']+". Do you wish to continue?") == true) {
                    curr_vault[i] = data;
                }
                found = true;
            }
        }
        //Append
        if(!found){
            curr_vault.push(data);
        }
        save_vault(curr_vault, function(){
            call_back(curr_vault);
        });
    });
}

function get_id_from_token(token) {
    return JSON.parse(b64utos(token.split('.')[1]))['user_id'];
}

function remove_from_vault(domain, call_back) {
    if (confirm("Are you sure you wish to delete the entry for "+domain+"?") == true) {
        get_vault(function(curr_vault) {
            for(var i = 0; i < curr_vault.length; i++) {
                if(curr_vault[i]['domain'] == domain) {
                    curr_vault.splice(i, 1);
                    save_vault(curr_vault, function(){

                    });
                    call_back(curr_vault);
                    return;
                }
            }
        });
    }
}
