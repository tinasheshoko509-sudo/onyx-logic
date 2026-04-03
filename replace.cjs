const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdir(dir, function(err, list) {
    if (err) return callback(err);
    let pending = list.length;
    if (!pending) return callback(null);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            if (!--pending) callback(null);
          });
        } else {
          if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(file, 'utf8');
            let newContent = content
              .replace(/bg-zinc-900/g, 'bg-zinc-100')
              .replace(/bg-zinc-800/g, 'bg-zinc-200');
            
            if (content !== newContent) {
              fs.writeFileSync(file, newContent, 'utf8');
              console.log('Updated', file);
            }
          }
          if (!--pending) callback(null);
        }
      });
    });
  });
}

walk('./pages', (err) => {
  if (err) console.error(err);
  else console.log('Pages done');
});
walk('./components', (err) => {
  if (err) console.error(err);
  else console.log('Components done');
});
