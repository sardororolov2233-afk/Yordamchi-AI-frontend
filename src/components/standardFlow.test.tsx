import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { account } from '../test/account';
import { ArticleForm } from './ArticleForm';
import { StandardMenu } from './StandardMenu';
import { ReferralModal } from './ReferralModal';
import { generateArticle, getJobStatus } from '../api/client';
vi.mock('../api/client',async importOriginal=>({...await importOriginal<typeof import('../api/client')>(),generateArticle:vi.fn(),getJobStatus:vi.fn()}));
vi.mock('../utils/telegram',()=>({showAlert:vi.fn()}));
beforeEach(()=>vi.resetAllMocks());
afterEach(cleanup);
const submit=()=>screen.getByRole('button',{name:/ILMIY MAQOLA YARATISH|LIMIT TEKSHIRILMOQDA|YARATILMOQDA/}) as HTMLButtonElement;
function fillArticle(){fireEvent.change(screen.getByPlaceholderText(/Masalan: Raqamli/),{target:{value:'Savod orgatish metodlari'}});fireEvent.change(screen.getByPlaceholderText('F.I.SH kiriting...'),{target:{value:'Test Author'}});}
describe('Shared Standard allowance in the existing frontend',()=>{
 it('shows one shared remainder for all3 services and switches all badges to1credit after the trial',()=>{
  const {rerender}=render(<StandardMenu isDark account={account(1)} onSelectService={()=>{}}/>);
  for(const name of ['Maqola','Obyektivka tayyorlash','Tezis / Referat']){
   const card=screen.getByRole('button',{name:new RegExp(name.replace('/','\\/'))});
   expect(within(card).getByText('Bepul limitdan')).toBeTruthy();
  }
  rerender(<StandardMenu isDark account={account(0,1)} onSelectService={()=>{}}/>);
  for(const name of ['Maqola','Obyektivka tayyorlash','Tezis / Referat']) expect(within(screen.getByRole('button',{name:new RegExp(name.replace('/','\\/'))})).getByText('1 kvota')).toBeTruthy();
 });
 it('blocks unknown and exhausted accounts even when an admin flag is passed',()=>{
  const {rerender}=render(<ArticleForm isDark account={null} isAdmin/>);
  expect(submit().disabled).toBe(true);
  rerender(<ArticleForm isDark account={account(0,0)} isAdmin/>);
  expect(submit().disabled).toBe(true);
  expect(vi.mocked(generateArticle)).not.toHaveBeenCalled();
  rerender(<ArticleForm isDark account={account(0,1)}/>);
  fillArticle();
  expect(submit().disabled).toBe(false);
 });
 it('preserves the same request UUID after a lost-response retry and waits for refreshed allowance',async()=>{
  vi.mocked(generateArticle).mockRejectedValueOnce(new Error('network lost')).mockResolvedValueOnce({id:'job-123',status:'queued',telegram_sent:false});
  vi.mocked(getJobStatus).mockRejectedValue(new Error('not found'));
  const refresh=vi.fn().mockResolvedValue(undefined);
  render(<ArticleForm isDark account={account(1)} onAccountRefresh={refresh}/>); fillArticle();
  fireEvent.click(submit());fireEvent.click(submit());
  await waitFor(()=>expect(refresh).toHaveBeenCalledTimes(1));
  await waitFor(()=>expect(submit().disabled).toBe(false));
  fireEvent.click(submit());
  await waitFor(()=>expect(generateArticle).toHaveBeenCalledTimes(2));
  const calls=vi.mocked(generateArticle).mock.calls;
  expect(calls[0][0].idempotencyKey).toBeTruthy();expect(calls[0][0].idempotencyKey).toEqual(calls[1][0].idempotencyKey);
 });
 it('recovers an already accepted article by UUID without spending another slot',async()=>{
  vi.mocked(generateArticle).mockRejectedValue(new Error('response lost'));
  vi.mocked(getJobStatus).mockImplementation(async id=>({id,status:'queued',service:'article',telegram_sent:false}));
  const started=vi.fn();render(<ArticleForm isDark account={account(1)} onJobStarted={started}/>);fillArticle();fireEvent.click(submit());
  await waitFor(()=>expect(started).toHaveBeenCalledTimes(1));
  expect(started.mock.calls[0][0]).toEqual(vi.mocked(generateArticle).mock.calls[0][0].idempotencyKey);
  expect(generateArticle).toHaveBeenCalledTimes(1);
 });
 it('explains pooled trial instead of advertising unlimited free articles in referral panel',()=>{
  render(<ReferralModal isOpen onClose={()=>{}} isDark account={account(0,2)}/>);
  expect(screen.queryByText('BEPUL')).toBeNull();
  expect(screen.getAllByText(/3 ta|3 talik/).length).toBeGreaterThan(0);
 });
});
