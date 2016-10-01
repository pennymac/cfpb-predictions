let fs = require('fs'),
{csvParse} = require('d3-dsv')

let content = fs.readFileSync('./rows.csv').toString()
let data = csvParse(content)
let natural = require('natural')
let Company = "Bank of America"

natural.PorterStemmer.attach();

let reliefCount = 0;

let mapRelief = (row) => {
  switch(row['Company response to consumer']) {
    case 'Closed with non-monetary relief':
    case 'Closed with monetary relief':
    case 'Closed with relief':
    reliefCount += 1
    return true
    default:
    return false
  }
}

filteredData = data.filter(d => d['Consumer complaint narrative'].length > 0 && d['Company response to consumer'] !== 'In progress' && d['Company response to consumer'] !== 'Untimely response')

let mappedAndFilterData = filteredData.map(d => Object.assign({}, d, {
  relief: mapRelief(d)
  // stemmedNarative: d['Consumer complaint narrative'].tokenizeAndStem()
}))

let recordsWithRelief = mappedAndFilterData.filter(d => d.relief )
let recordsWithoutRelief = mappedAndFilterData.filter(d => !d.relief )

console.log(mappedAndFilterData.length, recordsWithRelief.length, recordsWithoutRelief.length)
// console.log(maxppedAndFilterData.filter(d => d.stemmedNarative.length > 0)[0])

let classifier = new natural.LogisticRegressionClassifier();

for (var i = 0; i < mappedAndFilterData.length; i++) {
  console.log('add document ' + i);
  var d = mappedAndFilterData[i]
  classifier.addDocument([
  //d.Company.replace(/\s+/g, ''), 
  d.Product.replace(/\s+/g, ''), 
  d['Sub-product'].replace(/\s+/g, ''),
  d.Issue.replace(/\s+/g, ''), 
  d['Sub-issue'].replace(/\s+/g, ''),
  d['Consumer complaint narrative']].join(' '), 
  d.relief ? 'relief' : 'no-relief'
  );
}

classifier.events.on('trainedWithDocument', function (obj) {
   console.log(obj);
   /* {
   *   total: 23 // There are 23 total documents being trained against
   *   index: 12 // The index/number of the document that's just been trained against
   *   doc: {...} // The document that has just been indexed
   *  }
   */ 
});

console.log('start training')
classifier.train()
console.log('training completed');

classifier.save('classifier-all.json', function(err, classifier) {
    // the classifier is saved to the classifier.json file!
    console.log('file saved!');
});

