
// chrome.extension.onRequest.addListener(
// 	function(request, sender, sendResponse) {
// 		chrome.pageAction.show(sender.tab.id);
// 		sendResponse({});
// 	}
// );

// TODO: remove credentials from the vault

// For clearing out the local storage
function clear_storage() {
    chrome.storage.local.clear(function() {});
}

// Update with our service
// TODO
var sam_cookie_url = "http://www.example.com/";

// Check if the user logged in. Currently only checks if the cookie exists, later will send request to server for
// making sure token is still valid.
// TODO

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
        // Update
        // TODO: add warning
        for(var i = 0; i < curr_vault['creds'].length; i++) {
            if(curr_vault['creds'][i]['domain'] == data['domain']){
                found = true;
                curr_vault['creds'][i] = data;
            }
        }
        //Append
        if(!found){
            curr_vault['creds'].push(data);
        }
        save_vault(curr_vault, function(){
            call_back(curr_vault);
            console.log('Updated vault');
        });
    });
    }

