var singleQuote = document.getElementById('testForm2')
var doubleQuote = document.getElementById('testForm')
var jsonResult = document.getElementById('jsonResult')

function makeUrl(url, name, value) {
  url.indexOf('?') == -1 ? url += '?' : url += '&'
  url += name + '=' + value  
  return url
}

function makeObj(one, two) {
  console.log('one likes: ', one.likes)
  console.log('two likes: ', two.likes)
  return {
        stock: one.stock,
        price: one.price,
        rel_likes: one.likes - two.likes
      }  
}

function handleSubmit(event) {  
  event.preventDefault()  
  var form = document.getElementById(event.target.id)   
  var url = ''  
  for (var i = 0; i < form.elements.length - 1; i++) {
    var value = form.elements[i].value    
    var name = form.elements[i].name    
    if (name == 'like') {
      form.elements[i].checked ? value = 'true' : value = 'false'
    }    
    url = makeUrl(url, name, value)    
  }
  url = '/api/stock-prices' + url 
  form.reset()
  var req = new XMLHttpRequest()  
  req.open('GET', url, true)
  req.send()
  req.onload = function() {
    if (event.target.id == 'testForm') {      
      var result = JSON.parse(req.responseText)            
      var adjOne = makeObj(result.stockData[0], result.stockData[1]) 
      var adjTwo = makeObj(result.stockData[1], result.stockData[0])      
      jsonResult.textContent = JSON.stringify({stockData: [adjOne, adjTwo]}, null, ' ')      
    } else {
      jsonResult.textContent = req.responseText
    }
  }
}

singleQuote.addEventListener('submit', handleSubmit)
doubleQuote.addEventListener('submit', handleSubmit)