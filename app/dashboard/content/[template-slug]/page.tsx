'use client';
import React, { useState } from 'react'
import FormSection from '../_components/FormSection';
import OutputSection from '../_components/OutputSection';
import { TEMPLATE } from '../../_components/TemplateList';
import Templates from '@/app/(data)/Templates';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { chatSession } from '@/utils/AiModal';
import { db } from '@/utils/db';
import { AIOutput } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';

interface PROPS{
    params:{
        'template-slug':string
    }
}
function CreateNewContent(props:PROPS) {
    const selectedTemplate:TEMPLATE|undefined=Templates?.find((item)=>item.slug==props.params['template-slug'])
    const [loading, setLoading]=useState(false);
    const [aiOutput, setAiOutput]= useState<string>('');
    const {user}=useUser()

    const GenerateAIContent=async(formData:any)=>{
      setLoading(true);
     const SelectedPrompt=selectedTemplate?.aiPrompt;

     const FinalAIPrompt=JSON.stringify(formData)+", "+SelectedPrompt;
     const result=await chatSession.sendMessage(FinalAIPrompt);
     console.log(result.response.text());
     setAiOutput(result?.response.text());
     await SaveInDb(formData,selectedTemplate?.slug,result?.response.text())
     setLoading(false);
    }

    const SaveInDb = async (formData: any, slug: any, aiResp: string) => {
      const createdBy = user?.primaryEmailAddress?.emailAddress || 'unknown';
      const result = await db.insert(AIOutput).values({
        formData: formData,
        templateSlug: slug,
        aiResponse: aiResp,
        createdBy: createdBy,
        createdAt: moment().format('DD/MM/yyyy'),
      });
      console.log(result);
    };
    
    
  return (
    <div className='p-5'>
        <Link href={"/dashboard"}>
        <Button> <ArrowLeft/> Back</Button>
        </Link>
    <div className='grid grid-cols-1 md:grid-cols-3 gap-5 p-5'>
      <FormSection selectedTemplate={selectedTemplate} userFormInput={(v:any)=>GenerateAIContent(v)
      } loading={loading} />
      <div className='col-span-2'>
      <OutputSection aiOutput={aiOutput} />
      </div>
    </div>
    </div>
  )
}

export default CreateNewContent;
