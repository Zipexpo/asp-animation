import {useCallback, useEffect, useState} from "react";
import {Box, Stack, Grid} from "@mui/material";
import Chip from '@mui/material-next/Chip';
import TreeView from '../TreeView';
import "./index.css"

const codeData = `person (john). 
person(sam).
person(alice).
person(bill).
person(bob).
person(andy).
person(sarah).

gender(male).
gender(female).

father(john, sam).
father(john, bill).
father(bill, andy).

mother(alice, sam).
mother(alice, bill).
mother(sarah, andy).

gender_of(john, male).
gender_of(alice, female).
gender_of(sam, male).
gender_of(bill, male).
gender_of(andy, male).
gender_of(sarah, female).

parent(X,Y) :- father(X,Y).
parent(X,Y) :- mother(X,Y).

child(X,Y) :- parent(Y,X).

ancestor(X,Y) :- parent(X,Y).
ancestor(X,Y) :- parent(Z,Y), ancestor(X,Z).`
const script = [
    {text:'parent(X,Y)',label:'parent',atom:["X","Y"],type:'rule',onHover:[26,27]},
    {text:'child(X,Y)',label:'child',atom:["X","Y"],type:'rule',onHover:[29]},
    {text:'ancestor(X,Y)',label:'ancestor',atom:["X","Y"],type:'rule',onHover:[31,32]},
]
export default function() {
    const [codeline,setCodeline] = useState([]);
    const [codeHighlight,setCodeHighlight] = useState({});
    const [rootNode,setRootNode] = useState();
    useEffect(()=>{
        // analyze
        const lines = codeData.split('\n')
            .map((text,id)=>{
                const item = {id, text};
                const _text = text.trim();
                if (_text.match(/^%/))
                    item.type = 'commment';
                else if (text===''){
                    item.type = 'blank';
                }else{
                    const splitRule = text.split(':-');
                    if (splitRule.length>1) {
                        item.type = 'rule';
                        const ruleComp = sepRule(splitRule[0]);
                        Object.keys(ruleComp).forEach(k => item[k] = ruleComp[k]);
                        item.condition = [];
                        let isContinue = false;
                        let count = 0;
                        splitRule[1].replace('.','').split(/([(,)])/).forEach(s=>{
                            if (s==='(')
                                isContinue = true;
                            else if ((s===",")&& !isContinue){
                                count++;
                                return;
                            }else if (s===')'){
                                isContinue = false;
                            }
                            if (!item.condition[count])
                                item.condition[count] = {label:"",text:"",atom:[]};
                            item.condition[count].text += s;
                        })
                        item.condition.forEach((d,i)=>{
                            item.condition[i].text = d.text.trim();
                            item.condition[i] = {...item.condition[i],...sepRule(d.text.trim())};
                        });
                        function sepRule(t) {
                            const item = {};
                            const split = t.split('(');
                            item.label = split[0].trim();
                            if (split[1]){
                                item.labelText = t;
                                item.atom = split[1].replace(')',"").split(',').map(d=>d.trim());
                            }
                            return item;
                        }
                    }else {
                        const splitDefine = text.split('(');
                        if (splitDefine.length > 1) {
                            item.type = 'fact';
                            item.label = splitDefine[0].trim();
                            item.atom = text.split(`${splitDefine[0]}(`)[1].replace('.','').replace(')','').split(',').map(d => d.trim());
                        }
                    }
                }
                return item;
            })
        // todo detect option
        lines.option = lines.filter(d=>d.type==='fact' && d.label==='person');
        console.log(lines)
        setCodeline(lines);
    },[])
    const highlight = useCallback((list)=>{
        return ()=>{
            const hlist = {};
            list.forEach(d=>hlist[d]=1);
            setCodeHighlight(hlist);
        }
    },[codeline,script])

    return <Grid container sx={{height:'calc(100% - 66px)',overflow:'hidden'}}>
        <Grid item xs={3} sx={{borderRight:1,padding:1}} className={"shadow"}>
            <Stack spacing={1}>
                {script.map((s,i)=><Chip key={i} 
                label={s.text}
                onMouseEnter={highlight(s.onHover??[])}
                onMouseLeave={highlight([])}
                onClick={()=>setRootNode(s)}
                clickable/>)}
            </Stack>
        </Grid>
        <Grid item xs={9} sx={{padding:1,overflow:'auto',height:'100%'}}>
            <Stack sx={{display:'table', width:'100%'}} spacing={1}>
                {codeline.map(({text,id})=><Box key={id}
                sx={{display:'table-row', width:'auto', clear:'both', position:"relative"}}
                >
                    <Box sx={{position:'absolute',width:'100%',height:'100%',opacity:0.2, borderRadius:1}}
                    bgcolor={(theme)=>codeHighlight[id]?theme.palette.secondary.light:null}/>
                    <Box sx={{float:'left', display:'table-column', width:50, textAlign:'right',
                        userSelect:'none',paddingRight:1,borderRight:1}}>{id}</Box>
                    <Box sx={{float:'left', display:'table-column', width:'auto',paddingLeft:1}}>{text}</Box>
                </Box>)}
            </Stack>
        </Grid>
        <TreeView data={codeline} root={rootNode} open={!!rootNode} onClose={()=>setRootNode()}/>
    </Grid>
}