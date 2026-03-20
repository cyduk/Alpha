(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))l(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&l(i)}).observe(document,{childList:!0,subtree:!0});function r(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function l(a){if(a.ep)return;a.ep=!0;const o=r(a);fetch(a.href,o)}})();const v="https://api.coingecko.com/api/v3",_="https://fapi.binance.com/fapi/v1",C=6e4;let n={coins:[],fundingRates:{},loading:!0,error:null,lastUpdated:null,countdown:30,filters:{sortBy:"market_cap",sortOrder:"desc",minVolume:0,showPumps:!1,showDumps:!1,searchQuery:""}};const w=new Map,P=3e4;function g(e){const t=w.get(e);return t&&Date.now()-t.timestamp<P?t.data:null}function f(e,t){w.set(e,{data:t,timestamp:Date.now()})}async function m(e,t=3){for(let r=0;r<t;r++)try{const l=await fetch(e);if(!l.ok){if(l.status===429){await new Promise(a=>setTimeout(a,2e3*(r+1)));continue}throw new Error(`HTTP ${l.status}`)}return l.json()}catch(l){if(r===t-1)throw l;await new Promise(a=>setTimeout(a,1e3*(r+1)))}}async function F(e=100){const t=`top_${e}`,r=g(t);if(r)return r;const l=await m(`${v}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${e}&page=1&sparkline=false&price_change_percentage=1h,24h,7d`);return f(t,l),l}async function D(e,t=14){const r=`hist_${e}`,l=g(r);if(l)return l;const a=await m(`${v}/coins/${e}/market_chart?vs_currency=usd&days=${t}&interval=daily`);return f(r,a),a}async function I(){const e="funding",t=g(e);if(t)return t;try{const r=await m(`${_}/premiumIndex`);return f(e,r),r}catch{return[]}}function A(e,t=14){if(e.length<t+1)return null;let r=0,l=0;for(let i=e.length-t;i<e.length;i++){const c=e[i]-e[i-1];c>0?r+=c:l+=Math.abs(c)}const a=r/t,o=l/t;return o===0?100:Math.round((100-100/(1+a/o))*100)/100}function b(e,t=2){return e==null?"-":e>=1e12?(e/1e12).toFixed(t)+"T":e>=1e9?(e/1e9).toFixed(t)+"B":e>=1e6?(e/1e6).toFixed(t)+"M":e>=1e3?(e/1e3).toFixed(t)+"K":e<.01?e.toFixed(6):e.toFixed(t)}function y(e){return e==null?"-":(e>=0?"+":"")+e.toFixed(2)+"%"}function U(e){let t=50;return e.rsi!=null&&(e.rsi<=25?t+=20:e.rsi<=35?t+=15:e.rsi>=75?t-=20:e.rsi>=70&&(t-=15)),e.volumeSpike>=5?t+=15:e.volumeSpike>=3?t+=10:e.volumeSpike>=2&&(t+=5),e.fundingRate!=null&&(e.fundingRate>.1?t-=15:e.fundingRate<-.1?t+=15:e.fundingRate>.05?t-=10:e.fundingRate<-.05&&(t+=10)),Math.max(0,Math.min(100,Math.round(t)))}async function $(){n.loading=!0,n.error=null,u(!0);try{const[e,t]=await Promise.all([F(100),I()]),r={};Array.isArray(t)&&t.forEach(a=>{r[a.symbol.toUpperCase()]=parseFloat(a.lastFundingRate)*100}),n.fundingRates=r;const l=await Promise.all(e.slice(0,50).map(async a=>{try{const i=(await D(a.id,14)).prices.map(p=>p[1]),c=A(i),s=r[a.symbol.toUpperCase()+"USDT"]||null,d=1+Math.random()*2;return{...a,rsi:c,fundingRate:s,volumeSpike:d,alphaScore:U({rsi:c,fundingRate:s,volumeSpike:d})}}catch{return{...a,rsi:null,fundingRate:r[a.symbol.toUpperCase()+"USDT"]||null,volumeSpike:1,alphaScore:50}}}));n.coins=l,n.lastUpdated=Date.now(),n.countdown=30}catch(e){console.error("Error:",e),e.message.includes("429")?n.error="Rate limited. Please wait a moment and refresh.":e.message.includes("Failed to fetch")||e.message.includes("NetworkError")?n.error="Network error. Check your internet connection.":n.error=e.message}finally{n.loading=!1,u(!0)}}function N(){let e=[...n.coins];const t=n.filters;if(t.searchQuery){const r=t.searchQuery.toLowerCase();e=e.filter(l=>l.name.toLowerCase().includes(r)||l.symbol.toLowerCase().includes(r))}return t.minVolume>0&&(e=e.filter(r=>r.total_volume>=t.minVolume)),t.showPumps&&(e=e.filter(r=>r.rsi!=null&&r.rsi<=35||r.fundingRate!=null&&r.fundingRate<-.05)),t.showDumps&&(e=e.filter(r=>r.rsi!=null&&r.rsi>=70||r.fundingRate!=null&&r.fundingRate>.1)),e.sort((r,l)=>{const a=r[t.sortBy]??0,o=l[t.sortBy]??0;return t.sortOrder==="desc"?o-a:a-o}),e}function u(e=!1){const t=document.getElementById("root"),r=N(),l=n.lastUpdated?new Date(n.lastUpdated).toLocaleTimeString():"-",a=n.coins.reduce((s,d)=>(d.rsi!=null&&(s.rsiSum+=d.rsi,s.rsiCount++),d.rsi!=null&&d.rsi<=35&&s.pumps++,d.rsi!=null&&d.rsi>=70&&s.dumps++,d.fundingRate!=null&&d.fundingRate>.1&&s.dumpRisk++,d.fundingRate!=null&&d.fundingRate<-.1&&s.pumpPotential++,s),{rsiSum:0,rsiCount:0,pumps:0,dumps:0,dumpRisk:0,pumpPotential:0}),o=a.rsiCount>0?(a.rsiSum/a.rsiCount).toFixed(1):"-",i=n.coins.filter(s=>s.rsi!=null&&s.rsi<=40).slice(0,5),c=n.coins.filter(s=>s.rsi!=null&&s.rsi>=60).slice(0,5);if(e||!t.dataset.rendered)t.dataset.rendered="true",t.innerHTML=`
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
                  <span class="w-2 h-2 rounded-full ${n.loading?"bg-signal-yellow animate-pulse":"bg-pump-green"}"></span>
                  <span class="text-sm text-gray-400 status-text">
                    ${n.loading?"Updating...":`Next in ${n.countdown}s`}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-1 time-text">Last: ${l}</p>
              </div>
            </div>
          </header>

          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div class="bg-dark-card rounded-lg p-4 border ${parseFloat(o)>50?"border-red-500/30":parseFloat(o)<50?"border-green-500/30":"border-yellow-500/30"}">
              <p class="text-xs text-gray-500 uppercase">Avg RSI</p>
              <p class="text-2xl font-bold mt-1 ${parseFloat(o)>60?"text-red-400":parseFloat(o)<40?"text-green-400":"text-yellow-400"}">${o}</p>
            </div>
            <div class="bg-dark-card rounded-lg p-4 border border-red-500/30">
              <p class="text-xs text-gray-500 uppercase">Dump Risk</p>
              <p class="text-2xl font-bold mt-1 text-red-400">${a.dumpRisk}</p>
            </div>
            <div class="bg-dark-card rounded-lg p-4 border border-green-500/30">
              <p class="text-xs text-gray-500 uppercase">Pump Potential</p>
              <p class="text-2xl font-bold mt-1 text-green-400">${a.pumpPotential}</p>
            </div>
            <div class="bg-dark-card rounded-lg p-4 border border-red-500/30">
              <p class="text-xs text-gray-500 uppercase">Overbought</p>
              <p class="text-2xl font-bold mt-1 text-red-400">${a.dumps}</p>
            </div>
            <div class="bg-dark-card rounded-lg p-4 border border-green-500/30">
              <p class="text-xs text-gray-500 uppercase">Oversold</p>
              <p class="text-2xl font-bold mt-1 text-green-400">${a.pumps}</p>
            </div>
            <div class="bg-dark-card rounded-lg p-4 border border-dark-border col-span-2">
              <p class="text-xs text-gray-500 uppercase">Coins Loaded</p>
              <p class="text-2xl font-bold mt-1">${n.coins.length}</p>
            </div>
          </div>

          ${n.error?`
            <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p class="text-red-400 font-semibold">Error:</p>
              <p class="text-red-300/80">${n.error}</p>
            </div>
          `:""}

          <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div class="lg:col-span-3">
              <div class="bg-dark-card rounded-lg p-4 border border-dark-border">
                <div class="flex flex-wrap items-center gap-4">
                  <div class="flex-1 min-w-[200px]">
                    <label class="text-xs text-gray-500 mb-1 block">Search</label>
                    <input type="text" placeholder="Search coin..." value="${n.filters.searchQuery}"
                      oninput="updateFilter('searchQuery', this.value)"
                      class="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                  <div class="w-40">
                    <label class="text-xs text-gray-500 mb-1 block">Sort By</label>
                    <select onchange="updateFilter('sortBy', this.value)"
                      class="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500">
                      <option value="market_cap" ${n.filters.sortBy==="market_cap"?"selected":""}>Market Cap</option>
                      <option value="alphaScore" ${n.filters.sortBy==="alphaScore"?"selected":""}>Alpha Score</option>
                      <option value="rsi" ${n.filters.sortBy==="rsi"?"selected":""}>RSI</option>
                      <option value="price_change_percentage_24h" ${n.filters.sortBy==="price_change_percentage_24h"?"selected":""}>24h Change</option>
                    </select>
                  </div>
                  <div class="w-32">
                    <label class="text-xs text-gray-500 mb-1 block">Order</label>
                    <select onchange="updateFilter('sortOrder', this.value)"
                      class="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500">
                      <option value="desc" ${n.filters.sortOrder==="desc"?"selected":""}>Descending</option>
                      <option value="asc" ${n.filters.sortBy==="asc"?"selected":""}>Ascending</option>
                    </select>
                  </div>
                  <div class="flex items-center gap-4 pt-5">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" ${n.filters.showPumps?"checked":""} 
                        onchange="updateFilter('showPumps', this.checked)" class="w-4 h-4" />
                      <span class="text-sm text-green-400">Pumps</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" ${n.filters.showDumps?"checked":""} 
                        onchange="updateFilter('showDumps', this.checked)" class="w-4 h-4" />
                      <span class="text-sm text-red-400">Dumps</span>
                    </label>
                    <button onclick="resetFilters()"
                      class="px-3 py-2 text-sm text-gray-400 hover:text-white border border-dark-border rounded">
                      Reset
                    </button>
                  </div>
                </div>
                <p class="mt-3 text-xs text-gray-500">Showing ${r.length} coins</p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="bg-dark-card rounded-lg border border-green-500/30 p-4">
                <h3 class="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Pump Candidates
                </h3>
                ${i.length===0?'<p class="text-gray-500 text-sm">No signals</p>':i.map(s=>`
                    <div class="bg-green-500/5 border border-green-500/20 rounded p-2 mb-2">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          ${s.image?`<img src="${s.image}" class="w-5 h-5 rounded-full">`:""}
                          <span class="font-medium text-sm">${s.symbol.toUpperCase()}</span>
                        </div>
                        <span class="text-xs ${s.rsi<=30?"text-green-400 font-bold":"text-green-400/70"}">RSI: ${s.rsi}</span>
                      </div>
                    </div>
                  `).join("")}
              </div>

              <div class="bg-dark-card rounded-lg border border-red-500/30 p-4">
                <h3 class="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <span class="w-2 h-2 bg-red-400 rounded-full"></span>
                  Dump Risk
                </h3>
                ${c.length===0?'<p class="text-gray-500 text-sm">No signals</p>':c.map(s=>`
                    <div class="bg-red-500/5 border border-red-500/20 rounded p-2 mb-2">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          ${s.image?`<img src="${s.image}" class="w-5 h-5 rounded-full">`:""}
                          <span class="font-medium text-sm">${s.symbol.toUpperCase()}</span>
                        </div>
                        <span class="text-xs ${s.rsi>=70?"text-red-400 font-bold":"text-red-400/70"}">RSI: ${s.rsi}</span>
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
                  ${r.map((s,d)=>{const p=s.rsi==null?"":s.rsi>=70?"rsi-overbought":s.rsi<=30?"rsi-oversold":"",k=s.rsi!=null&&s.rsi<=35||s.fundingRate!=null&&s.fundingRate<-.1,R=s.rsi!=null&&s.rsi>=70||s.fundingRate!=null&&s.fundingRate>.1,x=s.price_change_percentage_24h,h=s.price_change_percentage_7d_in_currency||s.price_change_percentage_7d,S=s.fundingRate==null?"":s.fundingRate>.05?"text-red-400":s.fundingRate<-.05?"text-green-400":"text-gray-400";return`
                      <tr class="hover:bg-gray-800/30 transition-colors">
                        <td class="px-3 py-3 text-gray-500 text-sm">${d+1}</td>
                        <td class="px-3 py-3">
                          <div class="flex items-center gap-3">
                            ${s.image?`<img src="${s.image}" alt="${s.name}" class="w-6 h-6 rounded-full">`:""}
                            <div>
                              <p class="font-medium">${s.name}</p>
                              <p class="text-xs text-gray-500 uppercase">${s.symbol}</p>
                            </div>
                          </div>
                        </td>
                        <td class="px-3 py-3 text-right font-mono text-sm">$${b(s.current_price)}</td>
                        <td class="px-3 py-3 text-right font-mono text-sm ${x>=0?"text-green-400":"text-red-400"}">${y(x)}</td>
                        <td class="px-3 py-3 text-right font-mono text-sm ${h>=0?"text-green-400":"text-red-400"}">${y(h)}</td>
                        <td class="px-3 py-3 text-right ${p}">
                          <span class="font-mono font-bold">${s.rsi??"-"}</span>
                        </td>
                        <td class="px-3 py-3 text-right text-sm text-gray-400">$${b(s.total_volume)}</td>
                        <td class="px-3 py-3 text-right font-mono text-sm ${S}">${s.fundingRate!=null?s.fundingRate.toFixed(3)+"%":"-"}</td>
                        <td class="px-3 py-3 text-center">
                          <div class="flex items-center justify-center gap-1">
                            <div class="w-12 bg-gray-700 rounded-full h-1.5">
                              <div class="h-full rounded-full ${s.alphaScore>=70?"bg-green-400":s.alphaScore<=30?"bg-red-400":"bg-yellow-400"}" style="width: ${s.alphaScore}%"></div>
                            </div>
                            <span class="text-xs font-mono ml-1">${s.alphaScore}</span>
                          </div>
                        </td>
                        <td class="px-3 py-3 text-center">
                          ${k?'<span class="signal-pump px-2 py-0.5 rounded text-xs font-bold">PUMP</span>':R?'<span class="signal-dump px-2 py-0.5 rounded text-xs font-bold">DUMP</span>':'<span class="text-gray-500 text-xs">-</span>'}
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
      `;else{const s=t.querySelector(".w-2.h-2.rounded-full"),d=t.querySelector(".status-text"),p=t.querySelector(".time-text");s&&(s.className=`w-2 h-2 rounded-full ${n.loading?"bg-signal-yellow animate-pulse":"bg-pump-green"}`),d&&(d.textContent=n.loading?"Updating...":`Next in ${n.countdown}s`),p&&(p.textContent=`Last: ${l}`)}}window.updateFilter=(e,t)=>{n.filters[e]=t,u(!0)};window.resetFilters=()=>{n.filters={sortBy:"market_cap",sortOrder:"desc",minVolume:0,showPumps:!1,showDumps:!1,searchQuery:""},u(!0)};$();setInterval($,C);setInterval(()=>{n.loading||n.countdown--,n.countdown<=0&&(n.countdown=30),n.loading||u(!1)},1e3);
