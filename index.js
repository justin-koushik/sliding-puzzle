const can=document.querySelector("canvas")
const w=300
const h=300
can.width=w
can.height=h
can.style.border="1px solid"
const ctx=can.getContext("2d")
const show=document.querySelector("button")
function loadPuzzle(src='owl.jpg'){
    fetch(src).then(response=>{
        response.blob().then(fileBlob=>{
            createImageBitmap(fileBlob,{resizeWidth:w,resizeHeight:h,resizeQuality:'high'}).then(img=>{
                let canvas=new OffscreenCanvas(w,h)
                let context=canvas.getContext("2d")
                context.drawImage(img,0,0)
                const imgData=context.getImageData(0,0,w,h)
                let puzzle=new Puzzle(imgData)
                let dx=puzzle.dx
                let dy=puzzle.dy
                can.onclick=(e)=>{
                    let j=(e.x)/dx>>0
                    let i=(e.y)/dy>>0
                    let temp=puzzle.board[i][j]
                    if(temp){
                        if(i-1>=0 && puzzle.board[i-1][j]===null){
                            puzzle.board[i-1][j]=temp
                            puzzle.board[i][j]=null
                            puzzle.draw()
                            puzzle.checkSolve()
                        }else if(i+1<puzzle.m && puzzle.board[i+1][j]===null){
                            puzzle.board[i+1][j]=temp
                            puzzle.board[i][j]=null
                            puzzle.draw()
                            puzzle.checkSolve()
                        }else if(j-1>=0 && puzzle.board[i][j-1]===null){
                            puzzle.board[i][j-1]=temp
                            puzzle.board[i][j]=null
                            puzzle.draw()
                            puzzle.checkSolve()
                        }else if(j+1<puzzle.n && puzzle.board[i][j+1]===null){
                            puzzle.board[i][j+1]=temp
                            puzzle.board[i][j]=null
                            puzzle.draw()
                            puzzle.checkSolve()
                        }
                        if(puzzle.solved){
                            ctx.putImageData(imgData,0,0)
                            setTimeout(()=>{
                                puzzle.reset()
                            },2000)
                        }
                }
                    
                }
                show.onclick=()=>{
                    ctx.putImageData(imgData,0,0)
                    show.disabled=true
                    setTimeout(()=>{
                        show.disabled=false
                        puzzle.draw()
                    },2000)
                }
            })
        })
    })
}
class Puzzle{
    constructor(imgData,n=3,m=3){
        this.dx=w/n>>0
        this.dy=h/m>>0
        this.n=n
        this.m=m
        this.imgData=imgData
        this.board=new Array(m)
        for(let i=0;i<m;i++){
            let temp=new Array(n)
            for(let j=0;j<n;j++){
                temp[j]=[this.m*i+j,i*this.dy,j*this.dx]
            }
            this.board[i]=temp
        }
        this.board[m-1][n-1]=null
        this.empty=[m-1,n-1]
        this.reset()
    }
    reset(){
        this.solved=false
        this.initTiles()
        this.initEmpty()
        if (!this.isSolvable()) {
            if (this.empty[0] === 0 && this.empty[1]<= 1) {
              this.swapTiles(this.m-2, this.n- 1, this.m - 1, this.n- 1);
            } else {
              this.swapTiles(0, 0, 1, 0);
            }
            this.initEmpty();
          }
        this.solved = false;
        this.draw()
    }
    draw(){
        ctx.clearRect(0,0,w,h)
        ctx.fillStyle="rgba(200,100,0,0.2)"
        ctx.fillRect(0,0,w,h)
        for(let i=0;i<this.m;i++){
            for(let j=0;j<this.n;j++){
                if(this.board[i][j]){
                    let dy=i*this.dy+1
                    let dx=j*this.dx+1
                    let dirtyX=this.board[i][j][2]
                    let dirtyY=this.board[i][j][1]
                    let dirtyW=this.dx-2
                    let dirtyH=this.dy-2
                    ctx.putImageData(this.imgData,-dirtyX+dx,-dirtyY+dy,dirtyX,dirtyY,dirtyW,dirtyH)
                }
            }
        }
    }
    initTiles() {
        var i = this.n*this.m - 1;
        while (i > 0) {
          var j = Math.floor(Math.random() * i);
          var xi = i /this.m>>0;
          var yi = i%this.n;
          var xj = j/this.m>>0;
          var yj = j%this.n;
          this.swapTiles(xi, yi, xj, yj);
          --i;
        }
    }
    swapTiles(j1, i1, j2, i2) {
        var temp = this.board[i1][j1];
        this.board[i1][j1] = this.board[i2][j2];
        this.board[i2][j2] = temp;
    }
    initEmpty(){
        for(let i=0;i<this.m;i++){
            for(let j=0;j<this.n;j++){
                if(this.board[i][j]===null){
                    this.empty=[i,j]
                }
            }
        }
    }
    isSolvable() {
        if (this.n% 2 == 1) {
          return (this.sumInversions() % 2 == 0)
        } else {
          return ((this.sumInversions() + this.m - this.empty[0]-1) % 2 == 0)
        }
    }
    countInversions(i, j) {
        let inversions=0
        if(this.board[i][j]!==null){
            let boardVal=this.board[i][j][0]
            for(let y=i;y<this.m;y++){
                for(let x=j;x<this.n;x++){
                    let temp=this.board[y][x]
                    if(temp!==null){
                        if(temp[0]<boardVal){
                            inversions+=1
                        }
                    }
                }
            }
        }
        return inversions
    }
    sumInversions() {
        var inversions = 0;
        for (var i = 0; i < this.m; i++) {
          for (var j = 0; j < this.n; j++) {
            inversions += this.countInversions(i, j);
          }
        }
        return inversions;
    }
    checkSolve(){
        this.solved=true
        for (var i = 0; i < this.m; i++) {
            for (var j = 0; j < this.n; j++) {
              if(this.board[i][j]){
                if(i*this.m+j!==this.board[i][j][0]){
                    this.solved=false
                    return
                }
              }
            }
          }
    }
}
loadPuzzle("abcd.jpg")