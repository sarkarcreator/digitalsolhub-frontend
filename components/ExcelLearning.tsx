import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Lock, PlayCircle, Trophy, Loader2 } from 'lucide-react';
import { EXCEL_LESSONS } from '../data/excelCurriculum';
import {
  fetchExcelLearning, fetchExcelChapterTest, fetchExcelFinalTest,
  submitExcelLessonTest, completeExcelLesson, submitExcelChapterTest,
  submitExcelFinalTest, type ExcelLearningState, type LearningQuestion,
} from '../utils/api';

type Props = { courseId: string; courseName: string };

const ExcelLearning: React.FC<Props> = ({ courseId, courseName }) => {
  const [data,setData]=useState<ExcelLearningState|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [activeLessonId,setActiveLessonId]=useState<number|null>(null);
  const [lessonAnswer,setLessonAnswer]=useState('');
  const [test,setTest]=useState<{chapter:number|null;title:string;questions:LearningQuestion[];passingScore:number}|null>(null);
  const [answers,setAnswers]=useState<Record<number,string>>({});
  const [submitting,setSubmitting]=useState(false);

  const load=async()=>{
    setLoading(true);setError('');
    try{setData(await fetchExcelLearning(courseId));}
    catch(e){setError(e instanceof Error?e.message:'Excel learning path load nahi ho saka.');}
    finally{setLoading(false);}
  };
  useEffect(()=>{load();},[courseId]);

  const openChapterTest=async(chapter:number)=>{
    try{const r=await fetchExcelChapterTest(courseId,chapter);setAnswers({});setTest({chapter,title:r.title,questions:r.questions,passingScore:r.passingScore});setMessage('');}
    catch(e){setMessage(e instanceof Error?e.message:'Chapter test open nahi ho saka.');}
  };
  const openFinalTest=async()=>{
    try{const r=await fetchExcelFinalTest(courseId);setAnswers({});setTest({chapter:null,title:'Excel Final Test',questions:r.questions,passingScore:r.passingScore});setMessage('');}
    catch(e){setMessage(e instanceof Error?e.message:'Final test open nahi ho saka.');}
  };
  const finishLesson=async()=>{
    const lesson=activeLessonId?EXCEL_LESSONS[activeLessonId]:null;
    if(!lesson||lessonAnswer!==lesson.answer){setMessage('Knowledge check ka sahi jawab select karein.');return;}
    try{
      const check=await submitExcelLessonTest(courseId,lesson.id,lessonAnswer);
      if(!check.passed){setMessage(check.message||'Jawab durust nahi.');return;}
      await completeExcelLesson(courseId,lesson.id);
      setActiveLessonId(null);setLessonAnswer('');setMessage('Excel lesson complete ho gaya. Progress save ho gayi.');await load();
    }catch(e){setMessage(e instanceof Error?e.message:'Lesson complete nahi ho saka.');}
  };
  const submitTest=async()=>{
    if(!test||test.questions.some((_,i)=>!answers[i])){setMessage('Submit se pehle tamam sawalat ke jawab dein.');return;}
    setSubmitting(true);setMessage('');
    try{
      const result=test.chapter
        ? await submitExcelChapterTest(courseId,test.chapter,Object.values(answers))
        : await submitExcelFinalTest(courseId,Object.values(answers));
      setMessage(result.message);
      if(result.passed){setTest(null);setAnswers({});await load();}
    }catch(e){setMessage(e instanceof Error?e.message:'Test submit nahi ho saka.');}
    finally{setSubmitting(false);}
  };

  if(loading)return <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-gray-300"><Loader2 className="inline w-5 h-5 animate-spin mr-2"/> Excel learning path load ho raha hai...</div>;
  if(error)return <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-red-200">{error} <button onClick={load} className="underline ml-2">Retry</button></div>;
  if(!data)return null;

  const completed=new Set(data.completedLessons);
  const allDone=data.chapters.every(c=>c.passed);
  const dailyLeft=Math.max(0,data.dailyLessonLimit-data.dailyLessonsCompleted);

  return <section className="mt-8">
    <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><p className="text-green-300 text-xs font-bold uppercase tracking-wider">Next Learning Stage Unlocked</p><h2 className="text-2xl font-extrabold mt-1 flex items-center gap-2"><BookOpen className="text-green-300"/> Step 3 — Microsoft Excel</h2><p className="text-sm text-gray-300 mt-2">{courseName} ka Word final test pass karne par Excel automatically unlock hua. Excel ki progress Word se alag save hoti hai.</p></div>
        <div className="min-w-[210px] rounded-xl bg-slate-950/70 p-4"><div className="flex justify-between text-xs text-gray-400"><span>Excel progress</span><span>{data.progress.percentage}%</span></div><div className="h-2 bg-slate-800 rounded-full mt-2 overflow-hidden"><div className="h-full bg-green-400" style={{width:`${data.progress.percentage}%`}}/></div><p className="text-xs text-gray-400 mt-2">{data.progress.lessonsCompleted}/36 lessons • {data.progress.chaptersPassed}/12 chapters</p></div>
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><div><h3 className="text-xl font-bold">Excel Chapters & Lessons</h3><p className="text-sm text-gray-400">Har lesson ka knowledge check aur har chapter ka test pass karein.</p></div><span className="text-xs rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-gray-300">{dailyLeft} lessons left today</span></div>
    <div className="space-y-4">
      {data.chapters.map(ch=><div key={ch.number} className={`rounded-2xl border ${ch.unlocked?'border-white/10 bg-slate-900/60':'border-white/5 bg-slate-900/30 opacity-70'} p-5`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div><div className="flex items-center gap-2">{ch.unlocked?<BookOpen className="w-5 h-5 text-green-300"/>:<Lock className="w-5 h-5 text-gray-600"/>}<h4 className="font-bold text-lg">Chapter {ch.number}: {ch.title}</h4>{ch.passed&&<CheckCircle className="w-4 h-4 text-green-400"/>}</div><p className="text-xs text-gray-500 mt-1">{ch.lessons.filter(l=>completed.has(l.id)).length}/3 lessons completed</p></div>
          {ch.unlocked&&!ch.passed&&ch.lessons.every(l=>completed.has(l.id))&&<button onClick={()=>openChapterTest(ch.number)} className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-bold">Take Chapter Test</button>}
          {ch.passed&&<span className="text-xs font-bold text-green-400">Chapter Passed</span>}
        </div>
        <div className="grid md:grid-cols-3 gap-3 mt-4">{ch.lessons.map(l=>{const done=completed.has(l.id);const unlocked=ch.unlocked&&(l.number===1||completed.has(l.id-1));return <div key={l.id} className={`rounded-xl border p-4 ${done?'border-green-500/20 bg-green-500/5':unlocked?'border-green-400/20 bg-slate-950':'border-white/5 bg-slate-950/40'}`}><div className="flex justify-between"><p className="text-sm font-bold">Lesson {l.number}</p>{done?<CheckCircle className="w-4 h-4 text-green-400"/>:unlocked?<PlayCircle className="w-4 h-4 text-green-300"/>:<Lock className="w-4 h-4 text-gray-600"/>}</div><p className="text-xs text-gray-400 mt-2 min-h-10">{l.title}</p>{unlocked&&!done&&<button onClick={()=>{setActiveLessonId(l.id);setLessonAnswer('');setMessage('');}} className="mt-3 w-full py-2 rounded-lg bg-green-400 text-black text-xs font-bold">Open Lesson</button>}</div>})}</div>
      </div>)}
    </div>
    {allDone&&!data.finalPassed&&<div className="mt-6 rounded-2xl border border-purple-400/20 bg-purple-400/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4"><div><h3 className="font-bold text-lg flex items-center gap-2"><Trophy className="text-purple-400"/> Excel Final Test</h3><p className="text-sm text-gray-400">Tamam 12 chapter tests pass ho gaye. Ab final test dein.</p></div><button onClick={openFinalTest} className="px-5 py-3 rounded-lg bg-purple-500 text-white font-bold">Start Final Test</button></div>}
    {data.finalPassed&&<div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/5 p-5"><p className="font-bold text-green-300 flex items-center gap-2"><CheckCircle/> Microsoft Excel Course Completed</p><p className="text-sm text-gray-300 mt-1">Aap ne tamam Excel lessons aur final assessment complete kar liya hai.</p></div>}
    {message&&<div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] max-w-xl w-[calc(100%-2rem)] rounded-xl border border-cyan-400/30 bg-slate-900 px-5 py-3 text-sm text-white shadow-2xl">{message}</div>}
    {activeLessonId&&(()=>{const lesson=EXCEL_LESSONS[activeLessonId];return <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"><div className="max-w-3xl mx-auto my-6 rounded-2xl bg-slate-900 border border-green-400/20 p-6 md:p-8"><div className="flex justify-between gap-4 mb-6"><div><p className="text-green-300 text-xs font-bold uppercase">Microsoft Excel • Lesson {lesson.id} of 36</p><h3 className="text-2xl font-bold mt-2">{lesson.title}</h3><p className="text-sm text-gray-400 mt-2">{lesson.goal}</p></div><button onClick={()=>setActiveLessonId(null)} className="text-gray-400">✕</button></div><div className="space-y-5"><section><h4 className="font-bold text-green-300 mb-2">Asaan alfaaz mein samjhein</h4><p className="text-gray-300 leading-7">{lesson.explanation}</p></section><section className="rounded-xl bg-slate-950 border border-white/10 p-4"><h4 className="font-bold text-amber-300 mb-2">Example</h4><p className="text-gray-300 leading-7">{lesson.example}</p></section><section><h4 className="font-bold text-green-300 mb-2">Practical Steps</h4><ol className="list-decimal pl-5 space-y-2 text-gray-300">{lesson.steps.map((s,i)=><li key={i}>{s}</li>)}</ol></section><section className="rounded-xl bg-slate-950 border border-white/10 p-4"><h4 className="font-bold text-green-300 mb-2">Student Practice</h4><p className="text-gray-300 leading-7">{lesson.practice}</p></section><section><h4 className="font-bold mb-3">Knowledge Check</h4><p className="text-gray-200 mb-3">{lesson.question}</p><div className="grid gap-2">{lesson.options.map(o=><label key={o} className={`flex gap-3 items-center rounded-lg border p-3 cursor-pointer ${lessonAnswer===o?'border-green-400 bg-green-400/10':'border-white/10 bg-slate-950'}`}><input type="radio" name="excel-lesson-answer" checked={lessonAnswer===o} onChange={()=>setLessonAnswer(o)}/><span className="text-sm">{o}</span></label>)}</div></section></div><div className="flex justify-end gap-3 mt-7"><button onClick={()=>setActiveLessonId(null)} className="px-5 py-3 rounded-lg border border-white/10 text-gray-300">Close</button><button disabled={!lessonAnswer} onClick={finishLesson} className="px-5 py-3 rounded-lg bg-green-400 text-black font-bold disabled:opacity-50">Check & Complete Lesson</button></div></div></div>})()}
    {test&&<div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"><div className="max-w-2xl mx-auto mt-10 rounded-2xl bg-slate-900 border border-white/10 p-6 md:p-8"><div className="flex justify-between gap-4 mb-6"><div><p className="text-green-300 text-xs font-bold uppercase">Excel Assessment</p><h3 className="text-2xl font-bold">{test.title}</h3><p className="text-xs text-gray-400 mt-1">Passing score: {test.passingScore}%</p></div><button onClick={()=>setTest(null)} className="text-gray-400">✕</button></div><div className="space-y-6">{test.questions.map((q,i)=><div key={i}><p className="font-semibold mb-3">{i+1}. {q.q}</p><div className="grid gap-2">{q.options.map(o=><label key={o} className={`flex gap-3 items-center rounded-lg border p-3 cursor-pointer ${answers[i]===o?'border-green-400 bg-green-400/10':'border-white/10 bg-slate-950'}`}><input type="radio" name={`excel-q-${i}`} checked={answers[i]===o} onChange={()=>setAnswers(a=>({...a,[i]:o}))}/><span className="text-sm">{o}</span></label>)}</div></div>)}</div><button disabled={submitting} onClick={submitTest} className="mt-7 w-full py-3 rounded-lg bg-green-400 text-black font-bold disabled:opacity-60">{submitting?'Submitting...':'Submit Test'}</button></div></div>}
  </section>;
};

export default ExcelLearning;
