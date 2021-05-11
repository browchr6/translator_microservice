var express = require('express');
var app = express();
app.set('port',3100);

var CORS = require('cors');
app.use(CORS());

app.use(express.json());
app.use(express.urlencoded({extended:false}));

/* azure translator microservice from https://docs.microsoft.com/en-us/azure/cognitive-services/translator/quickstart-translator?tabs=nodejs */
const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');

var requesterKeySet = require('./requesters.js').requesters;
var subscriptionKey = require('./azureKey.js').key;
var endpoint = "https://api.cognitive.microsofttranslator.com";

var location = "westus2";

/* handler for translate requests need to have:
    - request key
    - from: language (optional)
    - to: language
    - text: text to be translated
*/

app.post('/translate',function(req,res) {
  // substitute fromt, to,text from request body
  if (!requesterKeySet.has(req.body.key)) {
    res.send('Please contact the administration to get a valid key to use the tranlsation service');
  }
  if (req.body.text.length > 1000) {
    res.send('Text to be translated must be less than or equal to 1000 characters');
    return;
  }
  var payload = {
    baseURL: endpoint,
    url: '/translate',
    method: 'post',
    headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Ocp-Apim-Subscription-Region': location,
        'Content-type': 'application/json',
        'X-ClientTraceId': uuidv4().toString()
    },
    params: {
        'api-version': '3.0',
        'from': req.body.from,
        'to': req.body.to
    },
    data: [{
        'text': req.body.text
    }],
    responseType: 'json'
  };
  axios(payload).then(function(response){
    console.log(JSON.stringify(response.data, null, 4));
    res.send(response.data);
  })
})

app.use(function(req,res){
    res.status(404);
    res.render('404');
  });
    
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
  });
    
  app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
  });