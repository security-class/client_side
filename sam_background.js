// SAM created by Wesley Powell Painter, Sydney Schweber and Omer Solmazer.

var sam_cookie_url = "https://pcs-sam.mybluemix.net/";
var url_base_auth = 'https://pcs-sam-auth.mybluemix.net/';
var url_base_vault = 'https://pcs-sam-vault.mybluemix.net/';
var token = ' ';
var uid = -1;

// Helper post function
function send_request(type, url, d, success_callback, error_callback) {
  $.ajax({
    type : type,
    url : url,
    dataType: "text",
    contentType: "application/json; charset=utf-8",
    headers: {
      "Authorization": "bearer "+token
    },
    data : JSON.stringify(d),

    success: function(msg){
        try{
            msg = JSON.parse(msg);
        }
        catch(SyntaxError){
        }
        success_callback(msg);
    },

    error: function (textStatus, errorThrown) {
      error_callback(textStatus, errorThrown);
    }
  }); 
}

function login(username, password, call_back) {
    send_request("POST", url_base_auth+"auth/token", { "email": username, "password": password}, 
    function(data){
        token = data;
        uid = get_id_from_token(token);
        set_login(token);
        // console.log(token);
        call_back(data);
    },
    function(status, error){
        call_back(null);
        console.log('Error logging in: ' + status + ' ' + error);
    });
}

function logout() {
    chrome.cookies.remove({"url": sam_cookie_url, "name": "sam"}, function(){});
    token = ' ';
    uid = -1;
}

function check_login(call_back) {
    chrome.cookies.get({"url": sam_cookie_url, "name": "sam"}, function(cookie) {
        if (cookie) {
            call_back(cookie.value);
        }
        else {
            call_back(null);
        }
    } );
}

// If user logs in, the token wil be written to cookies. Default option is hold cookie for the current session, and thats what we need.
function set_login(token) {
    chrome.cookies.set({"name": "sam", "url": sam_cookie_url, "value": token}, function (cookie){
        console.log("Cookie set!");
    })
}

function save_remote_vault(data, call_back) {
    if(data) {
        send_request("PUT", url_base_vault+"vault", { "user_id": uid, "data": data},
            function(response) {
                call_back(response["data"]);
            },
            function(status, error) {
                // console.log('Saving did not work. Error: ' + JSON.stringify(status));
            });
    }
}

function get_remote_vault(call_back) {
    if(uid == -1)
        return;
    send_request("GET", url_base_vault+"vault/"+uid, '', 
    function(data){
        var list = data["data"];
        if(list != null) {
            list = JSON.parse(list);
            call_back(list);
        }
    },
    function(status, error){
        var err = status;
        if(err['status'] == 404) {
            send_request("POST", url_base_vault+"vault", { "user_id": uid }, 
            function(data){
                call_back(data["data"]);
            },
            function(status, error) {
                console.log('Error from Post ? ' + JSON.stringify(status));
            });
        }
    });
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

function add_to_remote_vault(data, call_back) {
    get_remote_vault(function(curr_vault) {
        var found = false;
        // Update a domain
        for(var i = 0; i < curr_vault.length; i++) {
            if(curr_vault[i]["domain"] == data["domain"]){
                if (confirm("This will overwrite the username \""+curr_vault[i]["username"]+"\" and password for "+data["domain"]+". Do you wish to continue?") == true) {
                    curr_vault[i] = data;
                }
                found = true;
            }
        }
        //Append
        if(!found){
            try{
                curr_vault = JSON.parse(curr_vault);
            } catch (SyntaxError) {

            }
            curr_vault.push(data);
        }
        save_remote_vault(curr_vault, function(new_data){
            call_back(new_data);
        });
    });
}

function get_id_from_token(token) {
    return JSON.parse(b64utos(token.split('.')[1]))["user_id"];
}

function remove_from_vault(domain, call_back) {
    if (confirm("Are you sure you wish to delete the entry for "+domain+"?") == true) {
        get_remote_vault(function(curr_vault) {
            for(var i = 0; i < curr_vault.length; i++) {
                if(curr_vault[i]["domain"] == domain) {
                    curr_vault.splice(i, 1);
                    save_remote_vault(curr_vault, function(){
                        console.log(domain + ' removed from vault');
                    });
                    call_back(curr_vault);
                    return;
                }
            }
        });
    }
}
