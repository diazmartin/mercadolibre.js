(function(cookie) {
  var MercadoLibreW = {
    init: function() {
      var obj = this;
      if (typeof(window.MELI) === "undefined") {
        setTimeout('MercadoLibreW.init()', 50);
        return;
      }
      window.MELI.oldGetLoginStatus = window.MELI.getLoginStatus;
      window.MELI.oldExpireToken = window.MELI._expireToken;
      var self = this;
      window.MELI.getLoginStatus = function(callback) {
        var newCallback = window.MELI._partial(self.getLoginStatus, callback);
        window.MELI.oldGetLoginStatus(newCallback);
      };
      
      window.MELI._expireToken = this._expireToken;
      
      window.MELI._storeSecret = function(secret) {
          //skip subdomain
          var domain = document.domain.slice(document.domain.indexOf("."), document.domain.length);
          cookie("ats", JSON.stringify(secret), {domain:domain, path:"/"});
          this.secret = secret;
      };

      window.MELI._getApplicationInfo = function(callback) {
          window.MELI.appInfo = {id: window.MELI.options.client_id, site_id: window.MELI.options.site_id};
          if (callback) callback();
      };

      window.MELI._authorizationStateURL = function() {
        return this.authorizationStateURL.replace("SITE", this.appInfo.site_id.toLowerCase()) + "?client_id=" + this.options.client_id + "&redirect_uri=" + encodeURIComponent(this._xd_url()) + "&response_type=token&hashKey=" + obj._randomString(15);
      };

        
    },

    _expireToken : function(key) {
        window.MELI.oldExpireToken(key);
        //skip subdomain
        var domain = document.domain.slice(document.domain.indexOf("."), document.domain.length);
        cookie("ats", null, {domain:domain, path:"/"});
        window.MELI.isAuthorizationStateAvaible = false;
    },

    _randomString: function(qChars) {
      var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
      var randomstring = '';
      for (var i=0; i<qChars; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
      }
      return randomstring;
    },
    getLoginStatus: function(callback, status) {
        //user has an active session?
        if ((cookie("orgapi")=== null || cookie("orgapi") == "0")) {
            //no session
            if (status && status.state == "AUTHORIZED") {
                //no session but acvtive token. Shouldn't happen, expire token and fail
                this._expireToken(window.MELI._getKey());
                status=window.MELI.unknownStatus;
            }
        } 
        callback(status);
    }
  };
  window.MercadoLibreW = MercadoLibreW;
  MercadoLibreW.init();

})(cookie);
