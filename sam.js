
// $.get(chrome.extension.getURL("sam.html"), {}, function(data) {$('body').append(data);}, 'html');
// chrome.extension.sendRequest({}, function(response) {});


function login() {
  var user_name = document.getElementById('sam_user_name').value;
  var pw = document.getElementById('sam_password').value;
  document.getElementById('demo').textContent = user_name + " " + pw;
  var logged_in = false;
  var data = {'creds':[
  { 'user_name' : "bar", "pw" : "bar2" },
  { 'user_name' : "foo", "pw" : "foo1" },
  { 'user_name' : "stuff", "pw" : "staff" }
  ]};

    $.ajax({
        async:false,
        type : 'POST',
        url : '127.0.0.1:5000/',
        dataType: "text",
        contentType: "application/json; charset=utf-8",
        data : JSON.stringify({
            'username': 'user',
            'password': 'pass',
        }),

        success: function(msg){
          logged_in = true;
        },

        error: function (textStatus, errorThrown) {
          logged_in = false;
          console.log(textStatus);
          console.log(errorThrown);
          // alert(textStatus);
        }
    }); 

    if(!logged_in){
      document.getElementById('sam_login_div').hidden = true;
      document.getElementById('sam_pws_div').hidden = false;
      var table = document.getElementById('sam_pws_table')
      table.hidden = false;

      var list = data['creds'];
      var t = new Array(), j = -1;
      t[++j] = '<tr><th>User Name</th><th>Password</th></tr>';

      for (var i = 0; i < list.length; i++) {
        t[++j] ='<tr><td>';
        t[++j] = list[i]['user_name'];
        t[++j] = '</td><td>';
        t[++j] = list[i]['pw'];
        t[++j] = '</td></tr>';
      }
      $('#sam_pws_table').html(t.join(''));
    }
}

document.addEventListener('DOMContentLoaded', function() {
  $(document).ready(function(){
    document.getElementById('sam_login').onclick = login;
  });
});


