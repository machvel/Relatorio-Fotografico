var CACHE="relatorios-v1";
var BASE=["./","index.html","manifest.webmanifest","icon.svg"];
var PDF="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(BASE)}).then(function(){return self.skipWaiting()}));
});

self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});

self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET"){return}
  var url=new URL(req.url);
  var mine=url.origin===location.origin;
  if(!mine&&req.url!==PDF){return}
  e.respondWith(
    caches.match(req).then(function(hit){
      var net=fetch(req).then(function(res){
        if(res&&res.status===200){
          var copy=res.clone();
          caches.open(CACHE).then(function(c){c.put(req,copy)});
        }
        return res;
      }).catch(function(){return hit});
      return hit||net;
    })
  );
});
