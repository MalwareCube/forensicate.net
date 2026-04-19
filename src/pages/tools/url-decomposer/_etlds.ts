// Common multi-label effective TLDs.
// Curated subset of the Mozilla Public Suffix List, covering the country-code TLDs
// most often seen in DFIR work. Not exhaustive: e.g. some Australian state SLDs
// (.tas.gov.au) and rare regional suffixes are not included.
const MULTIPART_ETLD_LIST =
  'co.uk ac.uk gov.uk org.uk net.uk nhs.uk sch.uk plc.uk ltd.uk mod.uk police.uk parliament.uk ' +
  'com.au net.au org.au gov.au edu.au asn.au id.au csiro.au ' +
  'co.jp ne.jp ac.jp ad.jp ed.jp go.jp gr.jp lg.jp or.jp ' +
  'com.br net.br org.br gov.br edu.br mil.br ' +
  'co.in net.in org.in ac.in edu.in gov.in res.in gen.in firm.in ind.in ' +
  'com.cn net.cn org.cn gov.cn edu.cn ac.cn ' +
  'co.kr ne.kr or.kr re.kr go.kr ac.kr mil.kr pe.kr ' +
  'com.mx net.mx org.mx gob.mx edu.mx ' +
  'co.za net.za org.za gov.za edu.za ac.za mil.za web.za ' +
  'com.tr net.tr org.tr gov.tr edu.tr mil.tr gen.tr biz.tr info.tr name.tr k12.tr ' +
  'com.sg net.sg org.sg gov.sg edu.sg per.sg ' +
  'com.tw net.tw org.tw gov.tw edu.tw idv.tw game.tw club.tw ' +
  'com.hk net.hk org.hk gov.hk edu.hk idv.hk ' +
  'co.id net.id or.id ac.id sch.id mil.id web.id my.id biz.id go.id desa.id ' +
  'co.nz net.nz org.nz gov.nz ac.nz school.nz geek.nz kiwi.nz ' +
  'com.my net.my org.my gov.my edu.my mil.my name.my ' +
  'com.ar net.ar org.ar gov.ar edu.ar mil.ar ' +
  'co.il net.il org.il gov.il ac.il k12.il muni.il idf.il ' +
  'com.co net.co nom.co org.co gov.co edu.co mil.co ' +
  'co.th ac.th or.th go.th in.th mi.th net.th ' +
  'com.ph net.ph org.ph gov.ph edu.ph mil.ph ' +
  'com.vn net.vn org.vn gov.vn edu.vn ac.vn biz.vn info.vn name.vn pro.vn ' +
  'co.ve com.ve net.ve org.ve gov.ve edu.ve mil.ve ' +
  'com.pe net.pe org.pe gob.pe edu.pe mil.pe nom.pe ' +
  'com.ec net.ec org.ec gob.ec edu.ec mil.ec fin.ec pro.ec info.ec ' +
  'com.uy net.uy org.uy gub.uy edu.uy mil.uy ' +
  'co.cr or.cr ac.cr fi.cr go.cr sa.cr ' +
  'com.bo net.bo org.bo gob.bo edu.bo mil.bo tv.bo ' +
  'co.ug or.ug ac.ug sc.ug go.ug ne.ug com.ug ' +
  'co.ke or.ke ac.ke sc.ke go.ke ne.ke me.ke mobi.ke info.ke ' +
  'co.tz or.tz ac.tz sc.tz go.tz ne.tz hotel.tz me.tz mobi.tz ' +
  'com.eg net.eg org.eg gov.eg edu.eg mil.eg name.eg sci.eg ' +
  'com.sa net.sa org.sa gov.sa edu.sa med.sa pub.sa sch.sa ' +
  'com.ng net.ng org.ng gov.ng edu.ng mil.ng mobi.ng name.ng sch.ng ' +
  'co.ma ac.ma gov.ma press.ma net.ma org.ma ' +
  'com.pk net.pk org.pk gov.pk edu.pk biz.pk info.pk web.pk fam.pk ' +
  'com.bd net.bd org.bd gov.bd edu.bd ac.bd mil.bd ' +
  'co.bw or.bw ac.bw sc.bw ' +
  'co.zm ac.zm gov.zm sch.zm com.zm net.zm org.zm ' +
  'com.gh edu.gh gov.gh org.gh mil.gh ' +
  'com.ai net.ai org.ai off.ai ' +
  'com.do net.do org.do gob.do edu.do mil.do ' +
  'com.gt net.gt org.gt edu.gt gob.gt mil.gt ind.gt ' +
  'com.pa net.pa org.pa edu.pa gob.pa sld.pa ' +
  'com.py net.py org.py gov.py edu.py mil.py ' +
  'com.bh net.bh org.bh gov.bh edu.bh ' +
  'com.kw net.kw org.kw gov.kw edu.kw mil.kw ' +
  'com.qa net.qa org.qa gov.qa edu.qa mil.qa name.qa sch.qa ' +
  'com.lb net.lb org.lb gov.lb edu.lb ' +
  'com.jo net.jo org.jo gov.jo edu.jo mil.jo name.jo sch.jo ' +
  'com.kh net.kh org.kh gov.kh edu.kh mil.kh per.kh ' +
  'com.np net.np org.np gov.np edu.np mil.np ' +
  'com.lk net.lk org.lk gov.lk edu.lk ac.lk sch.lk ngo.lk soc.lk web.lk ' +
  'com.mt net.mt org.mt gov.mt edu.mt ' +
  'com.cy net.cy org.cy gov.cy ac.cy ekloges.cy press.cy biz.cy ' +
  'com.ge net.ge org.ge edu.ge gov.ge mil.ge pvt.ge';

export const MULTIPART_ETLDS: Set<string> = new Set(MULTIPART_ETLD_LIST.split(' '));

// Returns the registrable domain (apex) for a host, accounting for multi-label
// public suffixes. For example: mail.example.co.uk -> example.co.uk.
// Falls back to the last 2 labels for hosts whose suffix isn't in the curated list.
export function apexDomain(host: string): string {
  const parts = host.toLowerCase().split('.');
  if (parts.length < 2) return host;
  if (parts.length >= 3) {
    const last2 = parts.slice(-2).join('.');
    if (MULTIPART_ETLDS.has(last2)) return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}
