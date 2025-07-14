window.ParseTree = Class.create({
  initialize : function() {},

  build : function(inputString, json) {
    var root = new Element('div');
    var indices = [];
    var maxEndIndex = 0;
    for(key in json) {
      var items = json[key];
      items.each(function(item) {
        indices.push({start : item.start - 1, end : item.end, name : key});
        if(item.end > maxEndIndex) maxEndIndex = item.end;
      });
    }

    indices.sort(function(a,b) {
      return a.start === b.start ?
        a.end < b.end ? 1 : -1 :
        a.start < b.start ? -1 : 1;
    });

    var parents = [root];
    var seekIndex = 0;
    var count = 0;
    for(var i=0; i<=maxEndIndex; i++) {
      for(var j=0; j<indices.length; j++) {
        var index = indices[j];
        if(index.start === i) {
          if(seekIndex < i) {
            var subText = inputString.substring(seekIndex, i);
            var imaginaryIndex = document.createElement('div');
            imaginaryIndex.className = 'index imaginary';
            imaginaryIndex.appendChild(document.createTextNode(subText));
            var p = parents[parents.length -1];
            p.appendChild(imaginaryIndex);
          }
          seekIndex = i;
          var div = document.createElement("div");
          div.className = "index";
          div.id = "index_" + count;
          count++;
          parents[parents.length -1].appendChild(div);
          parents.push(div);
        }

        if(index.end === i) {
          p = parents.pop();
          subText = inputString.substring(seekIndex, index.end);
          p.appendChild(subText.length > 0 ?
            document.createTextNode(subText) :
            document.createElement("br"));
          seekIndex = i;
        }
      }
    }

    // add the structure to the document and traverse again to add name nodes
    indices.each(function(index, i) {
      div = root.down('#index_' + i);
      var nameDiv = document.createElement("div");
      nameDiv.className = "name";
      nameDiv.appendChild(document.createTextNode(index.name));
      div.appendChild(nameDiv);
    });
    return root;
  }
});
