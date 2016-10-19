var jsdom = require('jsdom');
var request = require('request');
var _async = require('async');
var http = require('http');
var server = http.createServer();
require('longjohn');

var url = 'http://www.mygermany.com/top-shops/';

console.log('Reading Started...');

jsdom.env({
  url: url,
  scripts: ["http://code.jquery.com/jquery.js"],
  done: function (err, window) {

    console.log('URL Reading Completed');

    if(err)
    console.log(err);

    else {
      var $ = window.$;

      console.log('dom loaded...');

      var items = $('.et_pb_portfolio_item');

      console.log('Items Recieved : ' + items.length);

      _async.eachSeries(items, function (item, callback) {
        (function (item, callback) {
          var image, imageSource, fileName, companyName, classes, website, category;

          image = $(item).find('img');
          imageSource = image.attr('src');

          if(imageSource != undefined) {
            fileName = imageSource.substr(imageSource.lastIndexOf('/') + 1);
            companyName = fileName.substr(0, fileName.indexOf('-'));
          }

          else {
            companyName = $(item).find('span').text()
          }

          classes = $(item).attr('class').split(' ');
          website = $(item).find('a').attr('href');

          for(var j = 0; j < classes.length; j++) {
            if(classes[j].indexOf('project_category') != -1) {
              var _class = classes[j];

              category = _class.substr(_class.lastIndexOf('-') + 1);
            }
          }

          if(website.indexOf('webmasterplan') != -1) {
            console.log(companyName + ' Website contains redirection...');

            jsdom.env({
              url: website,
              scripts: ["http://code.jquery.com/jquery.js"],
              done: function (err, window) {
                var jq = window.$;

                var meta = jq('meta');

                for(var k = 0; k < meta.length; k++) {
                  if('refresh' == jq(meta[k]).attr('http-equiv')) {
                    var content = jq(meta[k]).attr('content');
                    var url = 'http://partners.webmasterplan.com/' + content.substr(content.indexOf(';') + 6).replace('amp;', '');

                    request({ url: url, followRedirect: false }, function (err, res, body) {
                      if(err) {
                        callback(err);
                      }

                      website = res.headers.location;

                      console.log(companyName + ' ' + category + ' ' + website);
                      callback(null);
                      return;
                    });
                  }
                }
              }
            });
          }

          else {
            console.log(companyName + ' ' + category + ' ' + website);
            callback(null);
          }
        }(item, callback));
      }, function (err) {
        if(err)
        console.log(err);
      });
    }
  }
});
