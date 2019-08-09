<template>
    <section id="app">
        <ul class="controller">
            <li>底:<input type="number" v-model.number="triBottom" min="0.01" max="999.99"/>
                <template v-if="degree>0">∠{{degree.toFixed(2)}}°</template>
            </li>
            <li>高:<input type="number" v-model.number="triRight" min="0.01" max="999.99"/></li>
            <li>斜: {{length3.toFixed(2)}}<sup>2</sup> = {{(triBottom||0).toFixed(2)}}<sup>2</sup> + {{(triRight||0).toFixed(2)}}<sup>2</sup></li>
            <li>截:<input type="number" v-model.number="subLength" min="0.01" max="999.99"/>
                <template v-if="clipEdge>0">截红色: {{clipEdge.toFixed(2)}}</template>
            </li>
            <li><button @click="downloadCanvas">保存到相册</button></li>
        </ul>
        <a class="reset-btn" href="javascript: void(0)" @click="reset">重置</a>
        <canvas ref="cvs" :width="width" :height="height" style="border-bottom: 1px solid;"></canvas>
        <img class="image-output" ref="imageOutput"/>
    </section>
</template>
<script lang="ts">
    import { Component, Vue, Watch} from 'vue-property-decorator';
    import LocalStorage from '@/utils/LocalStorage';


    const ls = new LocalStorage();

    @Component({})
    export default class extends Vue {
        width: number = document.documentElement!.clientWidth;
        height: number = document.documentElement!.clientWidth;
        subLength: number = ls.getSubLength();
        triBottom: number = ls.getTriBottom();
        triRight: number = ls.getTriRight();
        length3 = 0;    // 斜边
        degree = 0;
        clipEdge = 0; //等腰三角形斜边长度
        mounted(){
            //this.width = this.$el.clientWidth;
            //this.height = this.$el.clientWidth;
            this.repaint();
        }
        repaint(){
            const ctx = this.canvasContext!;

            var {width, height, subLength, triBottom, triRight} = this;
            ctx.clearRect(0, 0, width, width); //清扫一下
            var baseY = .9*height;
            var baseWidth = .9*width - .1*width;
            //字体设置
            ctx.textAlign="center";
            ctx.font="26px Verdana";

            var oriPoint = {x: .1*width, y: baseY}; //三角形的左原点

            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.fillStyle='black';
            ctx.moveTo(oriPoint.x, oriPoint.y);
            ctx.lineTo(.9*width, baseY); //底线

            //底部长度文本
            ctx.fillText(String(this.triBottom), .5*this.width, .9*this.height + 20);


            ctx.lineTo(.9*width, baseY - this.triRight*baseWidth/this.triBottom); //按比例画出高
            ctx.fillText(String(this.triRight), .9*width, baseY - (this.triRight*baseWidth/this.triBottom)/2);

            ctx.lineTo(.1*width, baseY); // 返回原点


            ctx.stroke();//实际画出路径

            var degree = this.degree = Math.atan(this.triRight/this.triBottom)*180/Math.PI;
            var radius = width/10;
            //弧线
            ctx.arc(oriPoint.x, oriPoint.y, radius, 0, -Math.PI/180*degree, true);
            ctx.fillText(degree.toFixed(0)+'°', oriPoint.x+radius+20, oriPoint.y - 10);
            ctx.stroke();

            //画斜边
            {
                ctx.save();
                ctx.rotate(-Math.PI/180*degree);
                var offsetY = (Math.abs(Math.tan(Math.PI/180*degree) * (0.1 * width)) + 0.9 * width) * Math.cos(Math.PI/180*degree);
                this.length3 = Math.sqrt(Math.pow(this.triRight, 2) + Math.pow(this.triBottom, 2));
                ctx.fillText(this.length3.toFixed(2),  100 - 0.5*width, offsetY - 5);
            }

            ctx.restore();

            this.clipEdge = 0; //重置一下
            //短边必须小于任何一边
            if(subLength > 0 && triBottom >= subLength){
                var offsetAx = this.toPx(subLength);
                var offsetAy = 0;
                var offsetBx = this.toPx(subLength*Math.cos(Math.PI/180*degree));
                var offsetBy = this.toPx(subLength*Math.sin(Math.PI/180*degree));
                const pointAx = oriPoint.x + offsetAx;	//A点x
                const pointAy = oriPoint.y;				//A点y
                const pointBx = oriPoint.x + offsetBx;	//B点x
                const pointBy = oriPoint.y - offsetBy;	//B点y

                ctx.beginPath();
                ctx.fillStyle="red";
                ctx.arc(pointAx, pointAy, 3, 0, 2*Math.PI, true);

                ctx.arc(pointBx, pointBy, 3, 0, 2*Math.PI, true);

                ctx.fill();

                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.lineWidth=1;
                ctx.moveTo(pointAx, pointAy);
                ctx.lineTo(pointBx, pointBy); //底线
                ctx.stroke();

                const clipEdge = this.clipEdge = subLength*Math.sin(Math.PI/180*degree/2) * 2; //等腰三角形 - 斜边
                ctx.fillText(clipEdge.toFixed(2), (pointAx + pointBx)/2, (pointAy + pointBy)/2);

            }

        }
        toPx(realLength: number){
            var {width, height, triBottom} = this;
            var baseWidth = .9*width - .1*width;
            return  baseWidth*realLength/triBottom;
        }
        downloadCanvas(){
            var canvas = this.$refs.cvs as HTMLCanvasElement;
            //创建一个副本作为导出图片
            const cpCanvas = document.createElement('canvas')!;
            cpCanvas.width = canvas.width;
            cpCanvas.height = canvas.height;
            const cpCtx = cpCanvas.getContext('2d')!;
            cpCtx.fillStyle = "white";
            cpCtx.fillRect(0,0,canvas.width, canvas.height);
            cpCtx.fillStyle = "black"; //还原
            cpCtx.drawImage(canvas, 0, 0);
            const fontSize = 20;
            cpCtx.font=`${fontSize}px Verdana`;
            cpCtx.fillText(`底:${this.triBottom} ∠${this.degree.toFixed(2)}°`, 10, 30 + fontSize*0);
            cpCtx.fillText('高:'+this.triRight, 10, 30 + fontSize*1);
            cpCtx.fillText('斜边:'+this.length3.toFixed(2), 10, 30 + fontSize*2);
            cpCtx.fillText(`截:${this.subLength} 截红色:${this.clipEdge.toFixed(2)}`, 10, 30 + fontSize*3);
            //this.$refs.imageOutput.setAttribute('src', cpCanvas.toDataURL('image/png'));


            const a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
            a.setAttribute('href', cpCanvas.toDataURL('image/png')/*.replace("image/png", "image/octet-stream")*/);
            a.setAttribute('download', new Date().getTime()+'.png');
            const e = document.createEvent('MouseEvents');
            e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);

        }
        reset(){
            ls.reset();
            window.location.reload();
        }
        @Watch("triBottom")
        triBottomWatch(newVal: number, oldVal: number){
            if(newVal > 0){
                ls.setTriBottom(newVal);
                this.repaint();
            }
        }
        @Watch("triRight")
        triRightWatch(newVal: number, oldVal: number){
            if(newVal > 0){
                ls.setTriRight(newVal);
                this.repaint();
            }
        }
        @Watch("subLength")
        subLengthWatch(newVal: number, oldVal: number){
            ls.setSubLength(newVal);
            this.repaint();
        }

        get canvasContext(){
            var canvas = this.$refs.cvs;
            return (canvas as HTMLCanvasElement).getContext('2d');
        }

    }
</script>
<style lang="less" scoped>
    #app{
        position: relative;
        //max-width: 500px;
        margin: 0 auto;
        .controller{
            position: absolute;
            list-style-type: none;
            text-align: left;
        }
        .reset-btn{
            position: absolute;
            right: 10px;
            top: 5px;
            color: black;
        }
    }
</style>