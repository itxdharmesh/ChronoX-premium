// ==================== UTILS ====================

function av(n) { 
    var i = (n || 'U')[0].toUpperCase(); 
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%231a1f4e" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="%23D4AF37" font-size="40">' + i + '</text></svg>'; 
}

function tf(d) { 
    if (!d) return ''; 
    var df = Date.now() - d; 
    if (df < 60000) return 'Now'; 
    if (df < 3600000) return Math.floor(df / 60000) + 'm'; 
    if (df < 86400000) return Math.floor(df / 3600000) + 'h'; 
    return d.toLocaleDateString(); 
}

function toast(m, t) { 
    var e = document.querySelector('.toast'); 
    if (e) e.remove(); 
    var n = document.createElement('div'); 
    n.className = 'toast' + (t === 'error' ? ' error' : ''); 
    n.textContent = m; 
    document.body.appendChild(n); 
    setTimeout(function() { n.remove(); }, 3000); 
}

function openModal(id) { 
    document.getElementById(id).classList.add('show'); 
}

function closeModal(id) { 
    document.getElementById(id).classList.remove('show'); 
}

console.log('Utils loaded');
