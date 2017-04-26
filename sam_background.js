
// chrome.extension.onRequest.addListener(
// 	function(request, sender, sendResponse) {
// 		chrome.pageAction.show(sender.tab.id);
// 		sendResponse({});
// 	}
// );

// chrome.storage.local.clear(function() {});

function save_vault(data, call_back) {
    // Check that there's some code there.
    if (!data) {
        message('Error: No value specified');
        return;
    }
    // Save it using the Chrome extension storage API.
    chrome.storage.local.set({'sam_vault': data}, call_back() );
}

function get_vault(call_back) {
    chrome.storage.local.get('sam_vault', function (data) {
        var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), "password");
        encrypted = encrypted.toString();
        console.log('encrypted: ', encrypted);

        var decrypted = CryptoJS.AES.decrypt(encrypted, "password");
        decrypted = decrypted.toString(CryptoJS.enc.Utf8)
        console.log('decrypted: ', decrypted);

        // var encrypted = CryptoJS.AES.encrypt("Message", "Secret Passphrase");
        // var decrypted = CryptoJS.AES.decrypt(encrypted, "Secret Passphrase");
        // console.log('Encr: ');
        // console.log(encrypted);
        // console.log('Decryp: ');
        // console.log(decrypted);

        // var key = "passphrase";
        // var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key);
        // // console.log(data);
        // // console.log(encrypted);
        // console.log('unencrypted: '+JSON.stringify(data));
        // // sjcl.encrypt("data", data);
        // console.log('encrypted: ' + encrypted);
        // console.log('decrypted: ' + CryptoJS.AES.decrypt(encrypted, key));
        call_back(data['sam_vault']);
    }) 
}

function add_to_vault(data, call_back) {
    var s = "";

    get_vault(function(curr_vault) {
        var found = false;
        // Update
        for(var i = 0; i < curr_vault['creds'].length; i++) {
            // console.log(curr_vault['creds'][i]['domain'] + " and this: " + data['domain']);
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