/*!
* getusermedia-js
* v1.0.0 - 2015-12-20
* https://github.com/addyosmani/getUserMedia.js
* (c) Addy Osmani; MIT License
*/!function(a,b){"use strict";a.getUserMedia=function(a,c,d){if(void 0!==a&&(navigator.getUserMedia_=navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.msGetUserMedia,navigator.getUserMedia_)){var e,f,g,h,i,j={},k="";a.video===!0&&(j.video=!0,k="video"),a.audio===!0&&(j.audio=!0,""!==k&&(k+=", "),k+="audio"),e=b.getElementById(a.el),f=b.createElement("video"),h=parseInt(e.offsetWidth,10),i=parseInt(e.offsetHeight,10),a.width<h&&a.height<i&&(a.width=h,a.height=i),f.width=a.width,f.height=a.height,f.autoplay=!0,e.appendChild(f),g=f,a.videoEl=g,a.context="webrtc";try{navigator.getUserMedia_(j,c,d)}catch(l){try{navigator.getUserMedia_(k,c,d)}catch(m){return}}}}}(this,document);
