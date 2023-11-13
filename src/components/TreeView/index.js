import React, {useCallback, useEffect, useState, useRef} from 'react';
import {useTransition, animated, useSpringRef, useChain} from '@react-spring/web'
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {Box, MenuItem, TextField} from "@mui/material";
import {tree, stratify} from "d3-hierarchy";
import styles from './styles.module.css'
import {curveBumpY, link as d3link} from "d3-shape";

const UNCHECK = 'uncheck', VALID = 'valid', INVALID = "invalid";

export default function({data,root,open,onClose,w=500,h=1000}){
    const refAnimation = useRef([])
    const [rootTree, setRootTree] = useState();
    const [atom, setAtom] = useState([]);
    const [stage, setStage] = useState({node:[],link:[]});
    const [animate, setAnimate] = useState({node:{},link:{}});
    const [view, setView] = useState([0,0,w,h]);
    const [speed, setSpeed] = useState(1000);
    const nodeApi = useSpringRef();
    const transitionsNode = useTransition(stage.node, {
        from: (item)=>({
            opacity: 0,
            x:(item.parent?item.parent:item).x,
            y:(item.parent?item.parent:item).y
            // fill: '#8fa5b6',
        }),
        enter: (item)=> {
            return [
                {opacity: 1, x:item.x, y:item.y + (item.children ? 0 : 12)}
                // { fill: '#28d79f' },
                // { transform: 'perspective(600px) rotateX(0deg)' },
            ]
        },
        leave: item=>[
            // { fill: '#c23369' },
            { opacity: 0, x:(item.parent?item.parent:item).x,
                y:(item.parent?item.parent:item).y}],
        update: (item)=>({
            x:item.x,
            y:item.y + (item.children ? 0 : 12)
        }),
        trail:speed,
        ref: nodeApi,
    })
    const linkApi = useSpringRef();
    const transitionsLink = useTransition(stage.link, {
        from: {
            opacity: 0,
            // stroke: '#8fa5b6',
        },
        enter: [
            { opacity: 1, height:20, innerHeight:20 },
            // { stroke: 'black' },
            // { transform: 'perspective(600px) rotateX(0deg)' },
        ],
        leave: [
            { opacity: 0}
        ],
        // update: { stroke: '#28b4d7' },
        trail:speed,
        ref: linkApi,
    })
    useEffect(()=>{
        if (root){
            setAtom(root.atom.map(d=>d = null))
        }
    },[root])
    const reset = useCallback(()=>{
        refAnimation.current.forEach(clearTimeout)
        refAnimation.current = [];
        setStage({node:[],link:[]});
        setAnimate({node:{},link:{}});
        setSpeed(0);
        nodeApi.stop();
        linkApi.stop();
        return () => refAnimation.current.forEach(clearTimeout)
    },[]);
    const generateTree = useCallback((parent,atom)=>{
        // find rule
        let count = 0;
        const proot = {id:count, value:parent}
        const rules = [{parent:{}, children: proot}];
        const _linescaner = [...data];
        find_child(proot,parent.type,atom,_linescaner);
        const root = stratify().id(d=>d.children.id).parentId(d=>d.parent.id)(rules);
        setRootTree(root);
        function find_child(parent,type,atom,_linescaner){
            if (type==='rule'){
                const stack = [];
                const line = [..._linescaner];
                _linescaner.forEach((d,i)=> {
                    if (d) {
                        if (d.label === parent.value.label) {
                            if (d.type === 'rule') {
                                count++;
                                const children = {id:count,value:d};
                                rules.push({parent, children,atom});
                                line[i] = undefined; // remove avoid loop
                                const mapping = {};
                                d.atom.forEach((d,i)=>{
                                    mapping[d] = atom[i];
                                })

                                d.condition.forEach(e => {
                                    const _atom = e.atom.map(d=>mapping[d]??null);
                                    count++;
                                    const _children = {id:count,value:e};
                                    rules.push({parent: children, children:_children, atom: _atom});
                                    stack.push([_children, e.labelText ? 'rule' : 'fact',_atom,line])
                                    // find_child(children, e.labelText ? 'rule' : 'fact',_atom,line)
                                })
                            }else if (d.type === 'fact'){
                                count++;
                                const children = {id:count,value:d};
                                rules.push({parent, children,atom});
                            }
                        }
                    }
                });
                debugger
                stack.forEach(d=>find_child(d[0], d[1],d[2],d[3]))
            }else
                return rules;
        }
    },[data]);
    const onChangeAtom = useCallback((i)=>(event)=> {
        const _atom = [...atom];
        _atom[i] = event.target.value;
        setAtom(_atom);
        generateTree(root,_atom);
    },[atom,root,generateTree]);
    useEffect(()=>{
        if (rootTree){
            // Compute the layout.
            const dx = 50;
            const padding = 2;
            const dy = Math.min(50, h / (rootTree.height + padding));
            tree().nodeSize([dx, dy])(rootTree);
            // Center the tree.
            let x0 = Infinity;
            let x1 = -x0;
            rootTree.each(d => {
                d.type = UNCHECK;
                if (d.x > x1) x1 = d.x;
                if (d.x < x0) x0 = d.x;
            });

            // Compute the default width.
            if (w === undefined) w = x1 - x0 + dx * 2;

            //adjust leave
            const parentLevel = {};
            rootTree.leaves().forEach((d,i) => {
                parentLevel[d.parent.id] = (parentLevel[d.parent.id]??0) + 1;
                d.y = (parentLevel[d.parent.id]- 1) * 20 +d.y;
            });

            // setView([x0-dx,-dy*padding/2,w,h]);
            setView([-w/2,-dy*padding/2,w,h]);

            const node = rootTree.descendants();
            const curve = d3link(curveBumpY)
                .x(d => d.x)
                .y(d => d.y)
            const link = rootTree.links().map((d,i)=>{
                d.id = i;
                d.d = curve(d);
                d.type = UNCHECK;
                d.target.preLink = d.id;
                return d;
            });
            debugger
            reset();
            // setStage({node,link})
            // compute sequence
            const animates =[{node:{},link:{},time:node.length*1000}];
            const animate = {node:{},link:{},time:node.length*1000};
            // travel back
            // travelBack( rootTree.leaves());
            travelBack( rootTree);
            function travelBack(d){
                if (d.data.children.value.type==='fact'){
                    animate.node[d.id] = d.data.atom.reduce((p,c,i)=>c? (p&&(c===d.data.children.value.atom[i])):p,true)?VALID:INVALID;
                }else{
                    if (d.children){
                        animate.node[d.id] = (d.children.reduce((p,c)=> {
                            travelBack(c);
                            return (animate.node[c.id] === VALID) || p;
                        },false)?VALID:INVALID);
                    }else{
                        animate.node[d.id] = INVALID;
                    }
                }
                animate.link[d.preLink] = animate.node[d.id];
                animate.time += 1000;
                animates.push({node:{...animate.node},link:{...animate.link},time:animate.time})
            }
            refAnimation.current.push(setTimeout(() => setStage({node,link}), 500));
            refAnimation.current.push(setTimeout(() => setSpeed(1000), 500));
            refAnimation.current.push(setTimeout(() => nodeApi.start(),1000));
            refAnimation.current.push(setTimeout(() => linkApi.start(),1500));
            for (let i=0;i<animates.length;i++)
                refAnimation.current.push(setTimeout(() => {
                    console.log(i,animates[i].time)
                    setAnimate(animates[i])
                }, animates[i].time));
        }
    },[rootTree,w,h]);
    return <React.Fragment>
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="responsive-dialog-title"
      fullWidth={'md'}
    >
      <DialogTitle id="responsive-dialog-title">
        {"Firing View"}
      </DialogTitle>
      <DialogContent>
        {root&&<>
            <Box sx={{display:'flex'}} justifyContent={'center'} alignItems={'center'}>
                {root.label} ( {root.atom.map((a,i)=>
                <>{i?', ':''}<TextField select
                                        key={a}
                                        label={a}
                                        size={"small"}
                                        value={atom[i]}
                                        onChange={onChangeAtom(i)}
                >
                    {data.option.map(d=><MenuItem key={d.text} value={d.atom[0]}>
                        {d.atom[0]}
                    </MenuItem>)}
                    <MenuItem key={'undifinedValue'} value={null}>{a}</MenuItem>
                </TextField></>)} )
            </Box>
          <svg viewBox={view} width={'100%'}>
              {transitionsLink(({ ...rest }, item) => (
                      <animated.path d={item.d} style={rest} className={styles.transitionsPath}
                                     strokeWidth={animate.link[item.id] ? 2 : 1}
                                     stroke={animate.link[item.id] ? (animate.link[item.id] === INVALID ? '#e32222' : '#117e59') : '#ddd'}
                      >
                      </animated.path>
                  )
              )}
              {transitionsNode(({ ...rest }, item) => {
                      return (
                          <animated.text style={rest}
                                         fill={'black'}
                                         stroke={animate.node[item.id] ? (animate.node[item.id] === INVALID ? '#ff7474' : '#43d2a2') : '#e1f5ff'}
                                         className={styles.transitionsItem}>
                              {(item.data.children.value.type!=='fact')&&(item.data.children.value.id!==undefined)?item.data.children.value.id:(item.data.children.value.text)}
                          </animated.text>
                      )
                  }
              )}
          </svg>
        </>}
      </DialogContent>
    </Dialog>
  </React.Fragment>
}