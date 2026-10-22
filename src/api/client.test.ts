import { afterEach, expect, it, vi } from 'vitest';
import { downloadJob, generateObyektivka } from './client';
afterEach(()=>vi.unstubAllGlobals());
it('preserves the callers obyektivka UUID across retries instead of spending another shared slot',async()=>{
 const fetch=vi.fn().mockResolvedValue({ok:true,status:200,headers:new Headers({'Content-Type':'application/json'}),json:async()=>({id:'doc1',telegram_sent:true})});vi.stubGlobal('fetch',fetch);
 const data={fullName:'Test Author',currentPosition:'',birthDate:'',birthPlace:'',livingAddress:'',nationality:'',party:'',educationLevel:'',university:'',educationForm:'',specialty:'',academicDegree:'',academicTitle:'',qualificationLevel:'',phone:'',email:'',languages:[],awards:'',deputy:'',workHistory:[],relatives:[]};
 await generateObyektivka(data,'stable-uuid');await generateObyektivka(data,'stable-uuid');
 expect(fetch.mock.calls[0][1].headers['Idempotency-Key']).toBe('stable-uuid');
 expect(fetch.mock.calls[1][1].headers['Idempotency-Key']).toBe('stable-uuid');
});
it('downloads an article as DOCX even when CORS hides Content-Disposition',async()=>{
 const fetch=vi.fn().mockResolvedValue({ok:true,headers:new Headers({'Content-Type':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),blob:async()=>new Blob(['test'])});vi.stubGlobal('fetch',fetch);
 Object.defineProperty(URL,'createObjectURL',{configurable:true,value:vi.fn(()=> 'blob:test')});
 Object.defineProperty(URL,'revokeObjectURL',{configurable:true,value:vi.fn()});
 let filename='';vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(function(this: HTMLAnchorElement){filename=this.download;});
 await downloadJob('article1');expect(filename).toBe('hujjat_article1.docx');
});
