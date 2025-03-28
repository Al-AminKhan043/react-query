import { Link, redirect, useNavigate, useNavigation, useSubmit } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useParams } from 'react-router-dom';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';

import ErrorBlock from '../UI/ErrorBlock.jsx';
export default function EditEvent() {
  const submit=useSubmit();
  const {id}= useParams();
  const navigate = useNavigate();
  const {state}= useNavigation();

  const {data,isError,error}=useQuery({
    queryKey: ['events', id],
   queryFn: ({signal})=> fetchEvent({signal,id}),
   staleTime: 10000
  })

//  const {mutate}=useMutation({
//     mutationFn: updateEvent,
//     onMutate: async(data)=>{
//       const newEvent=data.event;
//      await queryClient.cancelQueries({queryKey:['events',id]})
//      const prevEvent=queryClient.getQueryData(['events',id])
//       queryClient.setQueryData(['events',id], newEvent);
//       return {
//         prevEvent
//       }

//     },
//     onError:(context)=>{
//       if(context?.prevEvent)
//      queryClient.setQueryData(['events',id], context.prevEvent)
//     },
//     onSettled: ()=> {
//       queryClient.invalidateQueries({ queryKey: ['events', id] });
//     } 
//   })

  function handleSubmit(formData) {

    // mutate({id, event: formData})
    // navigate('../')
    submit(formData,{
      method: 'PUT'
    })
  }

  function handleClose() {
    navigate('../');
  }
  let content;
  // if(isPending){
  //   content= (
  //      <div className='center'>
  //       <LoadingIndicator></LoadingIndicator>
  //      </div>
  //   )
  // }

  if(isError){
    content=(
      <>
      <ErrorBlock title='failed to load message'message={error.info?.message}></ErrorBlock>
      <div className='form-action'>
        <Link to='../' className='button'>Okay</Link>
      </div>
      </>
    )
  }
  if(data){
    content=(
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state==='submitting' ? <p>Updating Data</p> : (

          <>
             <Link to="../" className="button-text">
        Cancel
      </Link>
      <button type="submit" className="button">
        Update
      </button>
          </>
        ) }
   
    </EventForm>
    )
  }
  return (
    <Modal onClose={handleClose}>
       {content}
    </Modal>
  );
}

export function loader({params}){
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({signal})=> fetchEvent({signal,id: params.id})
  })
}

export  async function action ({request, params}){
const formData= await request.formData();
const updatedEventData= Object.fromEntries(formData);
await updateEvent({id: params.id, event: updatedEventData});
await queryClient.invalidateQueries(['events', ]);
return redirect('../');
}
