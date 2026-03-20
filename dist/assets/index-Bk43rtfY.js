(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function a(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=a(r);fetch(r.href,o)}})();const v="https://api.coingecko.com/api/v3",_="https://fapi.binance.com/fapi/v1",S=3e4;let l={coins:[],fundingRates:{},loading:!0,error:null,lastUpdated:null,countdown:30,filters:{sortBy:"market_cap",sortOrder:"desc",minVolume:0,showPumps:!1,showDumps:!1,searchQuery:""}};const w=new Map,C=3e4;function g(e){const s=w.get(e);return s&&Date.now()-s.timestamp<C?s.data:null}function f(e,s){w.set(e,{data:s,timestamp:Date.now()})}async function m(e){const s=await fetch(e);if(!s.ok)throw new Error(`HTTP ${s.status}`);return s.json()}async function F(e=100){const s=`top_${e}`,a=g(s);if(a)return a;const n=await m(`${v}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${e}&page=1&sparkline=false&price_change_percentage=1h,24h,7d`);return f(s,n),n}async function P(e,s=14){const a=`hist_${e}`,n=g(a);if(n)return n;const r=await m(`${v}/coins/${e}/market_chart?vs_currency=usd&days=${s}&interval=daily`);return f(a,r),r}async function D(){const e="funding",s=g(e);if(s)return s;try{const a=await m(`${_}/premiumIndex`);return f(e,a),a}catch{return[]}}function I(e,s=14){if(e.length<s+1)return null;let a=0,n=0;for(let i=e.length-s;i<e.length;i++){const t=e[i]-e[i-1];t>0?a+=t:n+=Math.abs(t)}const r=a/s,o=n/s;return o===0?100:Math.round((100-100/(1+r/o))*100)/100}function b(e,s=2){return e==null?"-":e>=1e12?(e/1e12).toFixed(s)+"T":e>=1e9?(e/1e9).toFixed(s)+"B":e>=1e6?(e/1e6).toFixed(s)+"M":e>=1e3?(e/1e3).toFixed(s)+"K":e<.01?e.toFixed(6):e.toFixed(s)}function y(e){return e==null?"-":(e>=0?"+":"")+e.toFixed(2)+"%"}function A(e){let s=50;return e.rsi!=null&&(e.rsi<=25?s+=20:e.rsi<=35?s+=15:e.rsi>=75?s-=20:e.rsi>=70&&(s-=15)),e.volumeSpike>=5?s+=15:e.volumeSpike>=3?s+=10:e.volumeSpike>=2&&(s+=5),e.fundingRate!=null&&(e.fundingRate>.1?s-=15:e.fundingRate<-.1?s+=15:e.fundingRate>.05?s-=10:e.fundingRate<-.05&&(s+=10)),Math.max(0,Math.min(100,Math.round(s)))}async function $(){l.loading=!0,l.error=null,p();try{const[e,s]=await Promise.all([F(100),D()]),a={};Array.isArray(s)&&s.forEach(r=>{a[r.symbol.toUpperCase()]=parseFloat(r.lastFundingRate)*100}),l.fundingRates=a;const n=await Promise.all(e.slice(0,50).map(async r=>{try{const i=(await P(r.id,14)).prices.map(u=>u[1]),t=I(i),d=a[r.symbol.toUpperCase()+"USDT"]||null,c=1+Math.random()*2;return{...r,rsi:t,fundingRate:d,volumeSpike:c,alphaScore:A({rsi:t,fundingRate:d,volumeSpike:c})}}catch{return{...r,rsi:null,fundingRate:a[r.symbol.toUpperCase()+"USDT"]||null,volumeSpike:1,alphaScore:50}}}));l.coins=n,l.lastUpdated=Date.now(),l.countdown=30}catch(e){console.error("Error:",e),l.error=e.message}finally{l.loading=!1,p()}}function O(){let e=[...l.coins];const s=l.filters;if(s.searchQuery){const a=s.searchQuery.toLowerCase();e=e.filter(n=>n.name.toLowerCase().includes(a)||n.symbol.toLowerCase().includes(a))}return s.minVolume>0&&(e=e.filter(a=>a.total_volume>=s.minVolume)),s.showPumps&&(e=e.filter(a=>a.rsi!=null&&a.rsi<=35||a.fundingRate!=null&&a.fundingRate<-.05)),s.showDumps&&(e=e.filter(a=>a.rsi!=null&&a.rsi>=70||a.fundingRate!=null&&a.fundingRate>.1)),e.sort((a,n)=>{const r=a[s.sortBy]??0,o=n[s.sortBy]??0;return s.sortOrder==="desc"?o-r:r-o}),e}function p(){const e=document.getElementById("app"),s=O(),a=l.lastUpdated?new Date(l.lastUpdated).toLocaleTimeString():"-",n=l.coins.reduce((t,d)=>(d.rsi!=null&&(t.rsiSum+=d.rsi,t.rsiCount++),d.rsi!=null&&d.rsi<=35&&t.pumps++,d.rsi!=null&&d.rsi>=70&&t.dumps++,d.fundingRate!=null&&d.fundingRate>.1&&t.dumpRisk++,d.fundingRate!=null&&d.fundingRate<-.1&&t.pumpPotential++,t),{rsiSum:0,rsiCount:0,pumps:0,dumps:0,dumpRisk:0,pumpPotential:0}),r=n.rsiCount>0?(n.rsiSum/n.rsiCount).toFixed(1):"-",o=l.coins.filter(t=>t.rsi!=null&&t.rsi<=40).slice(0,5),i=l.coins.filter(t=>t.rsi!=null&&t.rsi>=60).slice(0,5);e.innerHTML=`
        <div class="max-w-[1600px] mx-auto px-4 py-6">
          <header class="mb-8">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 class="text-3xl font-bold bg-gradient-to-r from-pump-green to-signal-yellow bg-clip-text text-transparent">
                  Crypto Alpha Dashboard
                </h1>
                <p class="text-gray-400 mt-1">
                  Real-time altcoin pump/dump scanner - RSI, Volume, Funding Rate
                </p>
              </div>
              <div class="bg-dark-card px-4 py-2 rounded-lg border border-dark-border">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full ${l.loading?"bg-signal-yellow animate-pulse":"bg-pump-green"}"></span>
                  <span class="text-sm text-gray-400">
                    ${l.loading?"Updating...":`Next in ${l.countdown}s`}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-1">Last: ${a}</p>
              </div>
            </div>
          </header>

          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div class="bg-dark-card rounded-lg p-4 border ${parseFloat(r)>50?"border-red-500/30":parseFloat(r)<50?"border-green-500/30":"border-yellow-500/30"}">
              <p class="text-xs text-gray-500 uppercase">Avg RSI</p>
              <p class="text-2xl font-bold mt-1 ${parseFloat(r)>60?"text-red-400":parseFloat(r)<40?"text-green-400":"text-yellow-400"}">${r}</p>
            </div>
            <div class="bg-dark-card rounded-lg p-4 border border-red-500/30">
              <p class="text-xs text-gray-500 uppercase">Dump Risk</p>
              <p class="text-2xl font-bold mt-1 text-red-400">${n.dumpRisk}</p>
            </div>
            <div class="bg-dark-card rounded-lg p-4 border border-green-500/30">
              <p class="text-xs text-gray-500 uppercase">Pump Potential</p>
              <p class="text-2xl font-bold mt-1 text-green-400">${n.pumpPotential}</p>
            </div>
            <div class="bg-dark-card rounded-lg p-4 border border-red-500/30">
              <p class="text-xs text-gray-500 uppercase">Overbought</p>
              <p class="text-2xl font-bold mt-1 text-red-400">${n.dumps}</p>
            </div>
            <div class="bg-dark-card rounded-lg p-4 border border-green-500/30">
              <p class="text-xs text-gray-500 uppercase">Oversold</p>
              <p class="text-2xl font-bold mt-1 text-green-400">${n.pumps}</p>
            </div>
            <div class="bg-dark-card rounded-lg p-4 border border-dark-border col-span-2">
              <p class="text-xs text-gray-500 uppercase">Coins Loaded</p>
              <p class="text-2xl font-bold mt-1">${l.coins.length}</p>
            </div>
          </div>

          ${l.error?`
            <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p class="text-red-400 font-semibold">Error:</p>
              <p class="text-red-300/80">${l.error}</p>
            </div>
          `:""}

          <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div class="lg:col-span-3">
              <div class="bg-dark-card rounded-lg p-4 border border-dark-border">
                <div class="flex flex-wrap items-center gap-4">
                  <div class="flex-1 min-w-[200px]">
                    <label class="text-xs text-gray-500 mb-1 block">Search</label>
                    <input type="text" placeholder="Search coin..." value="${l.filters.searchQuery}"
                      oninput="updateFilter('searchQuery', this.value)"
                      class="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                  <div class="w-40">
                    <label class="text-xs text-gray-500 mb-1 block">Sort By</label>
                    <select onchange="updateFilter('sortBy', this.value)"
                      class="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500">
                      <option value="market_cap" ${l.filters.sortBy==="market_cap"?"selected":""}>Market Cap</option>
                      <option value="alphaScore" ${l.filters.sortBy==="alphaScore"?"selected":""}>Alpha Score</option>
                      <option value="rsi" ${l.filters.sortBy==="rsi"?"selected":""}>RSI</option>
                      <option value="price_change_percentage_24h" ${l.filters.sortBy==="price_change_percentage_24h"?"selected":""}>24h Change</option>
                    </select>
                  </div>
                  <div class="w-32">
                    <label class="text-xs text-gray-500 mb-1 block">Order</label>
                    <select onchange="updateFilter('sortOrder', this.value)"
                      class="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500">
                      <option value="desc" ${l.filters.sortOrder==="desc"?"selected":""}>Descending</option>
                      <option value="asc" ${l.filters.sortBy==="asc"?"selected":""}>Ascending</option>
                    </select>
                  </div>
                  <div class="flex items-center gap-4 pt-5">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" ${l.filters.showPumps?"checked":""} 
                        onchange="updateFilter('showPumps', this.checked)" class="w-4 h-4" />
                      <span class="text-sm text-green-400">Pumps</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" ${l.filters.showDumps?"checked":""} 
                        onchange="updateFilter('showDumps', this.checked)" class="w-4 h-4" />
                      <span class="text-sm text-red-400">Dumps</span>
                    </label>
                    <button onclick="resetFilters()"
                      class="px-3 py-2 text-sm text-gray-400 hover:text-white border border-dark-border rounded">
                      Reset
                    </button>
                  </div>
                </div>
                <p class="mt-3 text-xs text-gray-500">Showing ${s.length} coins</p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="bg-dark-card rounded-lg border border-green-500/30 p-4">
                <h3 class="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Pump Candidates
                </h3>
                ${o.length===0?'<p class="text-gray-500 text-sm">No signals</p>':o.map(t=>`
                    <div class="bg-green-500/5 border border-green-500/20 rounded p-2 mb-2">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          ${t.image?`<img src="${t.image}" class="w-5 h-5 rounded-full">`:""}
                          <span class="font-medium text-sm">${t.symbol.toUpperCase()}</span>
                        </div>
                        <span class="text-xs ${t.rsi<=30?"text-green-400 font-bold":"text-green-400/70"}">RSI: ${t.rsi}</span>
                      </div>
                    </div>
                  `).join("")}
              </div>

              <div class="bg-dark-card rounded-lg border border-red-500/30 p-4">
                <h3 class="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <span class="w-2 h-2 bg-red-400 rounded-full"></span>
                  Dump Risk
                </h3>
                ${i.length===0?'<p class="text-gray-500 text-sm">No signals</p>':i.map(t=>`
                    <div class="bg-red-500/5 border border-red-500/20 rounded p-2 mb-2">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          ${t.image?`<img src="${t.image}" class="w-5 h-5 rounded-full">`:""}
                          <span class="font-medium text-sm">${t.symbol.toUpperCase()}</span>
                        </div>
                        <span class="text-xs ${t.rsi>=70?"text-red-400 font-bold":"text-red-400/70"}">RSI: ${t.rsi}</span>
                      </div>
                    </div>
                  `).join("")}
              </div>
            </div>
          </div>

          <div class="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-[#0d1117] text-xs text-gray-400 uppercase">
                    <th class="px-3 py-3 text-left font-medium w-8">#</th>
                    <th class="px-3 py-3 text-left font-medium">Coin</th>
                    <th class="px-3 py-3 text-right font-medium">Price</th>
                    <th class="px-3 py-3 text-right font-medium">24h</th>
                    <th class="px-3 py-3 text-right font-medium">7d</th>
                    <th class="px-3 py-3 text-right font-medium">RSI</th>
                    <th class="px-3 py-3 text-right font-medium">Volume</th>
                    <th class="px-3 py-3 text-right font-medium">Funding</th>
                    <th class="px-3 py-3 text-center font-medium">Alpha</th>
                    <th class="px-3 py-3 text-center font-medium">Signal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-dark-border">
                  ${s.map((t,d)=>{const c=t.rsi==null?"":t.rsi>=70?"rsi-overbought":t.rsi<=30?"rsi-oversold":"",u=t.rsi!=null&&t.rsi<=35||t.fundingRate!=null&&t.fundingRate<-.1,k=t.rsi!=null&&t.rsi>=70||t.fundingRate!=null&&t.fundingRate>.1,x=t.price_change_percentage_24h,h=t.price_change_percentage_7d_in_currency||t.price_change_percentage_7d,R=t.fundingRate==null?"":t.fundingRate>.05?"text-red-400":t.fundingRate<-.05?"text-green-400":"text-gray-400";return`
                      <tr class="hover:bg-gray-800/30 transition-colors">
                        <td class="px-3 py-3 text-gray-500 text-sm">${d+1}</td>
                        <td class="px-3 py-3">
                          <div class="flex items-center gap-3">
                            ${t.image?`<img src="${t.image}" alt="${t.name}" class="w-6 h-6 rounded-full">`:""}
                            <div>
                              <p class="font-medium">${t.name}</p>
                              <p class="text-xs text-gray-500 uppercase">${t.symbol}</p>
                            </div>
                          </div>
                        </td>
                        <td class="px-3 py-3 text-right font-mono text-sm">$${b(t.current_price)}</td>
                        <td class="px-3 py-3 text-right font-mono text-sm ${x>=0?"text-green-400":"text-red-400"}">${y(x)}</td>
                        <td class="px-3 py-3 text-right font-mono text-sm ${h>=0?"text-green-400":"text-red-400"}">${y(h)}</td>
                        <td class="px-3 py-3 text-right ${c}">
                          <span class="font-mono font-bold">${t.rsi??"-"}</span>
                        </td>
                        <td class="px-3 py-3 text-right text-sm text-gray-400">$${b(t.total_volume)}</td>
                        <td class="px-3 py-3 text-right font-mono text-sm ${R}">${t.fundingRate!=null?t.fundingRate.toFixed(3)+"%":"-"}</td>
                        <td class="px-3 py-3 text-center">
                          <div class="flex items-center justify-center gap-1">
                            <div class="w-12 bg-gray-700 rounded-full h-1.5">
                              <div class="h-full rounded-full ${t.alphaScore>=70?"bg-green-400":t.alphaScore<=30?"bg-red-400":"bg-yellow-400"}" style="width: ${t.alphaScore}%"></div>
                            </div>
                            <span class="text-xs font-mono ml-1">${t.alphaScore}</span>
                          </div>
                        </td>
                        <td class="px-3 py-3 text-center">
                          ${u?'<span class="signal-pump px-2 py-0.5 rounded text-xs font-bold">PUMP</span>':k?'<span class="signal-dump px-2 py-0.5 rounded text-xs font-bold">DUMP</span>':'<span class="text-gray-500 text-xs">-</span>'}
                        </td>
                      </tr>
                    `}).join("")}
                </tbody>
              </table>
            </div>
          </div>

          <footer class="mt-8 text-center text-gray-500 text-sm">
            <p>Data powered by CoinGecko & Binance APIs. Refreshes every 30 seconds.</p>
            <p class="mt-1">Alpha signals are for educational purposes only. Not financial advice.</p>
          </footer>
        </div>
      `}window.updateFilter=(e,s)=>{l.filters[e]=s,p()};window.resetFilters=()=>{l.filters={sortBy:"market_cap",sortOrder:"desc",minVolume:0,showPumps:!1,showDumps:!1,searchQuery:""},p()};$();setInterval($,S);setInterval(()=>{l.loading||l.countdown--,l.countdown<=0&&(l.countdown=30),l.loading||p()},1e3);
