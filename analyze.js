var natural = require('natural'),
  classifier = new natural.LogisticRegressionClassifier();

let {csvParse} = require('d3-dsv')
let fs = require('fs')
let content = fs.readFileSync('./rows.csv').toString()
let data = csvParse(content)

let mapRelief = (row) => {
  switch(row['Company response to consumer']) {
    case 'Closed with non-monetary relief':
    case 'Closed with monetary relief':
    case 'Closed with relief':
    return 'relief'
    default:
    return 'no-relief';
  }
}
var countMatch = 0;
var countTotal = 0;

var Company = 'PennyMac Loan Services, LLC'
Company = 'Bank of America'
//Company = 'Wells Fargo & Company'

natural.LogisticRegressionClassifier.load('classifier.json', null, function(err, classifier) {
  var count = 0;
  data.filter(d => d['Consumer complaint narrative'].length > 0 && d.Company === Company).forEach( d => {
    let prediction = classifier.classify( 
  [d.Product.replace(/\s+/g, ''), 
  d['Sub-product'].replace(/\s+/g, ''),
  d.Issue.replace(/\s+/g, ''), 
  d['Sub-issue'].replace(/\s+/g, ''),
  d['Consumer complaint narrative']].join(' '))
   let actual = mapRelief(d) 
   let match = prediction === actual
   if (match) countMatch++;
   countTotal++
   
   console.log( countTotal, prediction, actual ); 

  })

  console.log('Summary for', Company, countMatch, countTotal, ((countMatch / countTotal) * 100).toFixed(0) + '%' )

});

