import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, Lock, PlayCircle, RotateCcw, Trophy, Keyboard, Loader2, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { useRequireAuth } from '../utils/auth';
import {
  fetchOfficeManagementLearning,
  fetchOfficeManagementChapterTest,
  fetchOfficeManagementFinalTest,
  submitOfficeManagementTyping,
  completeOfficeManagementLesson,
  submitOfficeManagementChapterTest,
  submitOfficeManagementFinalTest,
  type OfficeLearningState,
  type LearningQuestion,
} from '../utils/api';

const CourseLearning: React.FC = () => {
  const { lang: paramLang, id } = useParams<{lang:string;id:string}>();
  const lang = (Object.values(Language).includes(paramLang as Language)) ? (paramLang as Language) : Language.ENGLISH;
  const navigate = useNavigate();
  const { authUser, loadingAuth } = useRequireAuth(lang, 'student');
  const [data,setData]=useState<OfficeLearningState|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [typed,setTyped]=useState('');
  const [typingStarted,setTypingStarted]=useState(false);
  const [typingStartedAt,setTypingStartedAt]=useState<number|null>(null);
  const [typingSubmitting,setTypingSubmitting]=useState(false);
  const [test,setTest]=useState<{chapter:number|null;title:string;questions:LearningQuestion[];passingScore:number}|null>(null);
  const [answers,setAnswers]=useState<Record<number,string>>({});
  const [testSubmitting,setTestSubmitting]=useState(false);
  const [message,setMessage]=useState('');

  const courseId=String(id||'');
  const courseName=data?.course.name||'Office Management';

  const load=async()=>{
    setLoading(true);setError('');
    try{setData(await fetchOfficeManagementLearning(courseId,courseName));}
    catch(e){setError(e instanceof Error?e.message:'Unable to load learning path.');}
    finally{setLoading(false);}
  };
  useEffect(()=>{if(authUser)load();},[authUser,id]);

  const typingElapsed=useMemo(()=>typingStartedAt?Math.max(1,Math.floor((Date.now()-typingStartedAt)/1000)):0,[typed,typingStartedAt]);
  const startTyping=()=>{setTypingStarted(true);setTypingStartedAt(Date.now());setTyped('');setMessage('');};
  const submitTyping=async()=>{
    if(!typingStartedAt||!typed.trim())return;
    setTypingSubmitting(true);setMessage('');
    try{
      const result=await submitOfficeManagementTyping({courseId,courseName,typedText:typed,elapsedSeconds:Math.max(5,Math.floor((Date.now()-typingStartedAt)/1000))});
      setMessage(result.message);await load();
      if(result.passed){setTypingStarted(false);}
    }catch(e){setMessage(e instanceof Error?e.message:'Typing test failed.');}
    finally{setTypingSubmitting(false);}
  };

  const openChapterTest=async(chapter:number)=>{
    try{
      const result=await fetchOfficeManagementChapterTest(courseId,courseName,chapter);
      setAnswers({});setTest({chapter,title:result.title,questions:result.questions,passingScore:result.passingScore});setMessage('');
    }catch(e){setMessage(e instanceof Error?e.message:'Unable to open chapter test.');}
  };
  const openFinalTest=async()=>{
    try{
      const result=await fetchOfficeManagementFinalTest(courseId,courseName);
      setAnswers({});setTest({chapter:null,title:'Word Final Test',questions:result.questions,passingScore:result.passingScore});setMessage('');
    }catch(e){setMessage(e instanceof Error?e.message:'Unable to open final test.');}
  };
  const submitTest=async()=>{
    if(!test||test.questions.some((_,i)=>!answers[i])){setMessage('Please answer every question before submitting.');return;}
    setTestSubmitting(true);setMessage('');
    try{
      const result=test.chapter
        ? await submitOfficeManagementChapterTest(courseId,courseName,test.chapter,Object.values(answers))
        : await submitOfficeManagementFinalTest(courseId,courseName,Object.values(answers));
      setMessage(result.message);
      if(result.passed){setTest(null);setAnswers({});await load();}
    }catch(e){setMessage(e instanceof Error?e.message:'Test submission failed.');}
    finally{setTestSubmitting(false);}
  };

  if(loadingAuth||loading)return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin text-cyan-400"/></div>;
  if(error)return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6"><div className="max-w-lg text-center"><h2 className="text-2xl font-bold mb-3">Learning Path Unavailable</h2><p className="text-gray-400 mb-6">{error}</p><button onClick={()=>navigate(`/${lang}/course/${id}`)} className="px-5 py-2 rounded-lg bg-cyan-400 text-black font-bold">Back to Course</button></div></div>;
  if(!data)return null;

  const completed=new Set(data.word.chapters.flatMap(c=>c.lessons).filter(l=>data.state.completedLessons.includes(l.id)).map(l=>l.id));
  const allWordDone=data.word.chapters.every(c=>c.passed);
  const dailyLeft=Math.max(0,data.requirements.dailyLessonLimit-data.dailyLessonsCompleted);

  return <div className="min-h-screen bg-slate-950 text-white pt-20 pb-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <button onClick={()=>navigate(`/${lang}/course/${id}`)} className="text-sm text-gray-400 hover:text-white mb-5">← Back to course</button>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div><p className="text-cyan-400 text-sm font-bold uppercase tracking-wider">Office Management Learning Path</p><h1 className="text-3xl md:text-4xl font-extrabold mt-2">Learn → Practice → Test → Unlock</h1><p className="text-gray-400 mt-2">Your progress is saved securely. You must pass each stage before the next stage unlocks.</p></div>
          <div className="rounded-xl border border-white/10 bg-slate-900 px-5 py-4 min-w-[220px]"><div className="flex justify-between text-xs text-gray-400"><span>Word progress</span><span>{data.progress.percentage}%</span></div><div className="h-2 bg-slate-800 rounded-full mt-2 overflow-hidden"><div className="h-full bg-cyan-400" style={{width:`${data.progress.percentage}%`}}/></div><p className="text-xs text-gray-500 mt-2">{data.progress.lessonsCompleted}/36 lessons • {data.progress.chaptersPassed}/12 chapters</p></div>
        </div>
      </div>

      {!data.typing.passed ? <section className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6 md:p-8 mb-8">
        <div className="flex items-center gap-3 mb-4"><Keyboard className="w-6 h-6 text-amber-300"/><h2 className="text-2xl font-bold">Step 1 — Typing Qualification Test</h2></div>
        <p className="text-gray-300 mb-4">Pass at least <b>{data.requirements.typingMinWpm} WPM</b> and <b>{data.requirements.typingMinAccuracy}% accuracy</b> to unlock Microsoft Word.</p>
        <div className="rounded-xl bg-slate-950 border border-white/10 p-5 text-gray-300 leading-8 font-mono text-sm">{data.typing.passage}</div>
        {!typingStarted ? <button onClick={startTyping} className="mt-5 px-6 py-3 rounded-lg bg-amber-300 text-black font-bold inline-flex items-center gap-2"><PlayCircle className="w-5 h-5"/> Start Typing Test</button> :
        <div className="mt-5"><textarea autoFocus value={typed} onChange={e=>setTyped(e.target.value)} className="w-full min-h-36 rounded-xl bg-slate-950 border border-cyan-400/30 p-4 text-white outline-none focus:border-cyan-400" placeholder="Type the passage exactly as shown above..."/><div className="flex flex-wrap gap-3 mt-4"><span className="px-3 py-2 rounded-lg bg-slate-900 text-gray-300 text-sm">Timer: {typingElapsed}s</span><button disabled={typingSubmitting||typed.trim().length<40} onClick={submitTyping} className="px-5 py-2 rounded-lg bg-cyan-400 text-black font-bold disabled:opacity-50">{typingSubmitting?'Checking...':'Submit Typing Test'}</button><button onClick={startTyping} className="px-4 py-2 rounded-lg border border-white/10 text-gray-300"><RotateCcw className="w-4 h-4 inline mr-1"/> Restart</button></div></div>}
      </section> : <section className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5 mb-8 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><CheckCircle className="text-green-400"/><div><p className="font-bold">Typing qualification passed</p><p className="text-xs text-gray-400">{data.typing.wpm} WPM • {data.typing.accuracy}% accuracy</p></div></div><span className="text-green-400 text-sm font-bold">Word unlocked</span></section>}

      {data.typing.passed && <section>
        <div className="flex items-center justify-between mb-5"><div><h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="text-cyan-400"/> Step 2 — Microsoft Word</h2><p className="text-sm text-gray-400 mt-1">Maximum 3 lesson completions per day. Chapter test unlocks after all 3 lessons.</p></div><span className="text-xs px-3 py-2 rounded-lg bg-slate-900 border border-white/10">{dailyLeft} lesson{dailyLeft===1?'':'s'} left today</span></div>
        <div className="space-y-4">
          {data.word.chapters.map(ch=> <div key={ch.number} className={`rounded-2xl border ${ch.unlocked?'border-white/10 bg-slate-900/60':'border-white/5 bg-slate-900/30 opacity-70'} p-5`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div><div className="flex items-center gap-2">{ch.unlocked?<BookOpen className="w-5 h-5 text-cyan-400"/>:<Lock className="w-5 h-5 text-gray-600"/>}<h3 className="font-bold text-lg">Chapter {ch.number}: {ch.title}</h3>{ch.passed&&<CheckCircle className="w-4 h-4 text-green-400"/>}</div><p className="text-xs text-gray-500 mt-1">{ch.lessons.filter(l=>completed.has(l.id)).length}/3 lessons completed</p></div>
              {ch.unlocked && !ch.passed && ch.lessons.every(l=>completed.has(l.id)) && <button onClick={()=>openChapterTest(ch.number)} className="px-4 py-2 rounded-lg bg-purple-500 text-white font-bold text-sm">Take Chapter Test</button>}
              {ch.passed&&<span className="text-xs font-bold text-green-400">Chapter Passed</span>}
            </div>
            <div className="grid md:grid-cols-3 gap-3 mt-4">{ch.lessons.map(l=>{const done=completed.has(l.id);const lessonUnlocked=ch.unlocked&&(l.number===1||completed.has(l.id-1));return <div key={l.id} className={`rounded-xl border p-4 ${done?'border-green-500/20 bg-green-500/5':lessonUnlocked?'border-cyan-400/20 bg-slate-950':'border-white/5 bg-slate-950/40'}`}><div className="flex justify-between gap-2"><p className="text-sm font-bold">Lesson {l.number}</p>{done?<CheckCircle className="w-4 h-4 text-green-400"/>:lessonUnlocked?<PlayCircle className="w-4 h-4 text-cyan-400"/>:<Lock className="w-4 h-4 text-gray-600"/>}</div><p className="text-xs text-gray-400 mt-2 min-h-10">{l.title}</p>{lessonUnlocked&&!done&&<button onClick={async()=>{try{await completeOfficeManagementLesson(courseId,courseName,l.id);setMessage('Lesson completed successfully.');await load();}catch(e){setMessage(e instanceof Error?e.message:'Unable to complete lesson.')}}} className="mt-3 w-full py-2 rounded-lg bg-cyan-400 text-black text-xs font-bold">Mark Lesson Complete</button>}</div>})}</div>
          </div>)}
        </div>
        {allWordDone&&!data.word.finalPassed&&<div className="mt-6 rounded-2xl border border-purple-400/20 bg-purple-400/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4"><div><h3 className="font-bold text-lg flex items-center gap-2"><Trophy className="text-purple-400"/> Word Final Test</h3><p className="text-sm text-gray-400">All 12 chapter tests passed. Final test is now available.</p></div><button onClick={openFinalTest} className="px-5 py-3 rounded-lg bg-purple-500 text-white font-bold">Start Final Test <ArrowRight className="inline w-4 h-4"/></button></div>}
        {data.excelUnlocked&&<div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/5 p-6"><div className="flex items-center gap-3"><CheckCircle className="text-green-400"/><div><h3 className="font-bold text-lg">Microsoft Word Completed</h3><p className="text-sm text-gray-400">Microsoft Excel is now unlocked for your next learning stage.</p></div></div></div>}
      </section>}

      {message&&<div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[calc(100%-2rem)] rounded-xl border border-cyan-400/30 bg-slate-900 px-5 py-3 text-sm text-white shadow-2xl">{message}</div>}

      {test&&<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"><div className="max-w-2xl mx-auto mt-10 rounded-2xl bg-slate-900 border border-white/10 p-6 md:p-8"><div className="flex justify-between gap-4 mb-6"><div><p className="text-cyan-400 text-xs font-bold uppercase">Assessment</p><h2 className="text-2xl font-bold">{test.title}</h2><p className="text-xs text-gray-400 mt-1">Passing score: {test.passingScore}%</p></div><button onClick={()=>setTest(null)} className="text-gray-400 hover:text-white">✕</button></div><div className="space-y-6">{test.questions.map((q,i)=><div key={i}><p className="font-semibold mb-3">{i+1}. {q.q}</p><div className="grid gap-2">{q.options.map(opt=><label key={opt} className={`flex gap-3 items-center rounded-lg border p-3 cursor-pointer ${answers[i]===opt?'border-cyan-400 bg-cyan-400/10':'border-white/10 bg-slate-950'}`}><input type="radio" name={`q-${i}`} checked={answers[i]===opt} onChange={()=>setAnswers(a=>({...a,[i]:opt}))}/><span className="text-sm">{opt}</span></label>)}</div></div>)}</div><button disabled={testSubmitting} onClick={submitTest} className="mt-7 w-full py-3 rounded-lg bg-cyan-400 text-black font-bold disabled:opacity-60">{testSubmitting?'Submitting...':'Submit Test'}</button></div></div>}
    </div>
  </div>;
};
export default CourseLearning;
