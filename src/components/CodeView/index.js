import {useEffect, useState} from "react";
import {Box, Stack} from "@mui/material";

const codeData = `% facts
% father(F, C): F is the father of C
% mother(M, C): F is the mother of C

father(ad, willem).
mother(anje, willem).

father(werner, marina).
mother(danny, marina).

father(richard, werner).
mother(rosa, werner).

father(cornelis_wilhelmus, ad).
mother(corry, ad).

% reasoning
% descendant(D, A): A is the ancestor of descendant D
descendant(D, A) :- father(A, D).
descendant(D, A) :- mother(A, D).
descendant(D, A) :- descendant(D, Z), father(A, Z).
descendant(D, A) :- descendant(D, Z), mother(A, Z).`
export default function() {
    const [codeline,setCodeline] = useState([]);
    useEffect(()=>{
        setCodeline(codeData.split('\n'));
    },[])
    return <Stack sx={{display:'table', width:'100%'}} spacing={1}>
        {codeline.map((d,i)=><Box sx={{display:'table-row', width:'auto', clear:'both'}}>
            <Box sx={{float:'left', display:'table-column', width:50, textAlign:'right',paddingRight:1,borderRight:1}}>{i}</Box>
            <Box sx={{float:'left', display:'table-column', width:'auto',paddingLeft:1}}>{d}</Box>
        </Box>)}
    </Stack>
}