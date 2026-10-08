const fs = require("fs");
const LINKS = {
  hotel: ["DVPWP04j4aq","DUXC2OggLTC","DURRUl4j00E","DRieRJpD8ga","DMgjOk3PULT","DMO2XZqgAv7","DI2AjSZPe8b","DIxasMLAr4W","DIg8vHpA9A0","DIF0YQjgzZ6","DHrIE4RPTD0","DHZhDAzPzWl","DHT3z_KvxTF","DHJdBAcgxXF","DBmZzFGyEn1","C-wDBXtu6Us","C8viWkou1y6","C8dC4gFOpV2","C67cjTcujYF","C5xFK0sOYLn","C3oOZL5OXWS","C2D-y1_OH3Z"],
  restaurante: ["DZV5HhAgwnz","DY3biBSgfid","DYVU6YZPeqN","DX0TQJHAoHN","DXVyDxkgHlz","DXGM7MYAF1G","DWNEEsfj2-2","DWH1e35DxJC","DUornaXj7zc","DRkgHLWj-nB","DQ-yYeqANoO","DOCtqmcgBCR","DL_d9BmgJlB","DL8gq-6vF9n","DLtTAEYg2KY","DKnnwfrPSl5","DJw4IABgfOe","DJNhUj-v0K0","DJAbcjqvDLk","DIxasMLAr4W","DImjI_APekl","DIVH8fWAVEh","DHJdBAcgxXF","DFu7YUSOim6","DD7Zgyzu7tb","C8qEKixOQCF","C8MyNmsuHN-","C8JVQBLuLM0","C41fyu6OTZK","C3_iYbzuEJ5","C2swrqbun-c","C2TRK_tuJPH","C2OPeaJuMaB","C2I_hEUOpDq","CruRRV4NK-Q"],
  cafe: ["Db9KoGTP380","DYJOGWHghni","DRvES5UD7y5","DQ5mAlxgBZT","DO6-OFRDa8M","DM3nQ_FPSJZ","DELKBfjyezY","C-B2ZBpO6OK","C9ykiPCObmj","C7VG9QbO2-E"],
  panorama: ["DbWZ18DP2kn","DalyhcfAlE9","DUg-BnLD8Tr","DRSgBkiCTvk","DQS5NHrgNDv","DQFEylPAH-4","DMO2XZqgAv7","DKDDfmjPUFV","DIg8vHpA9A0","DY5H8I8vtaL","DccG79EvATQ","DcNGkHBAS56","DbgvHJ2vJAy","Db6v33qAjZQ","Dbt2PD-AwO1","DbjS5tLPT6W"]
};
const CAT = {
  hotel:       {label:"Hotel & Cabana",   filter:"cabanas",     badge:"Alojamiento"},
  restaurante: {label:"Restaurante",       filter:"restaurante", badge:"Gastronomia"},
  cafe:        {label:"Cafe & Kuchen",     filter:"cafe",        badge:"Cafe"},
  panorama:    {label:"Panorama & Dato",  filter:"aventura",    badge:"Panorama"}
};
let id=1, reels=[];
for(const [catKey,codes] of Object.entries(LINKS)){
  const c=CAT[catKey];
  for(const sc of codes){
    reels.push({id:id++,shortcode:sc,igUrl:"https://www.instagram.com/reel/"+sc+"/",thumbUrl:"https://www.instagram.com/p/"+sc+"/media/?size=m",title:c.label+" · @datitosdelajose",lugar:"Puerto Varas · Region de Los Lagos",categoria:c.label,filter:c.filter,badge:c.badge,desc:"Recomendacion comprobada personalmente por Maria Jose Ibanez Walker (@datitosdelajose).",detalles:"Visita el reel en Instagram para mas informacion.",waLink:"https://wa.me/56979430387?text=Hola!%20Vi%20el%20video%20de%20%40datitosdelajose%20y%20quiero%20consultar.",airbnbLink:"",igHandle:"@datitosdelajose"});
  }
}
const header="// js/reels-data.js - Catalogo oficial desde Datitos_reales.xlsx\n// Hotel:"+LINKS.hotel.length+" Restaurante:"+LINKS.restaurante.length+" Cafe:"+LINKS.cafe.length+" Panorama:"+LINKS.panorama.length+" Total:"+reels.length+"\n\nconst REELS_DATA = "+JSON.stringify(reels,null,2)+";\n\nif(typeof module!=='undefined') module.exports={REELS_DATA};\n";
fs.writeFileSync("js/reels-data.js",header,"utf8");
console.log("OK",reels.length,"reels");
