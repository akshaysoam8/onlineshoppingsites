var jsdom = require('jsdom');
var request = require('request');
var _async = require('async');
var fs = require('fs');
require('longjohn');

var url = 'http://www.mygermany.com/top-shops/';

console.log('Reading Started...');

fs.writeFile('temp.csv', '', function (err) {
  if(err)
    console.log(err);
});

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

      for(var i = 0; i < items.length; i++) {
        (function (item) {
          var image, imageSource, fileName, companyName = '', classes, website = '', category = '';

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

                      writeToFile(companyName, category, website);
                    });
                  }
                }
              }
            });
          }

          else {
            writeToFile(companyName, category, website);
          }
        }(items[i]));
      }
    }
  }
});

function writeToFile(companyName, category, website) {
  fs.writeFile('temp.csv', companyName + ', ' + category + ', ' + website + '\n', {'flag':'a'}, function (err) {
    if(err)
      console.log(err);
  });
}
