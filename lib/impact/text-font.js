ig.baked = true;
ig.module('impact.text-font')
    .defines(function(){
        "use strict";

        ig.TextFont = ig.Class.extend({
            size: 18,
            color: '#ffffff',
            lineSpacing: 0,
            letterSpacing: 0,

            init: function(size, color) {
                this.size = size || this.size;
                this.color = color || this.color;
            },

            widthForString: function(text) {
                // This is a simplified calculation. For accurate width,
                // it would require measuring text on a canvas context.
                // For now, we'll use a rough estimate.
                return text.length * (this.size * 0.6) + this.letterSpacing * text.length;
            },

            heightForString: function(text) {
                return text.split('\n').length * (this.size + this.lineSpacing);
            },

            draw: function(text, x, y, align) {
                if (typeof text != 'string') {
                    text = text.toString();
                }

                var ctx = ig.system.context;
                ctx.save();

                ctx.font = this.size + 'px Arial'; // You can change the font family
                ctx.fillStyle = this.color;
                ctx.textBaseline = 'top';

                var lines = text.split('\n');
                var lineHeight = this.size + this.lineSpacing;

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var drawX = x;

                    if (align == ig.Font.ALIGN.RIGHT) {
                        drawX -= ctx.measureText(line).width;
                    } else if (align == ig.Font.ALIGN.CENTER) {
                        drawX -= ctx.measureText(line).width / 2;
                    }

                    ctx.fillText(line, ig.system.getDrawPos(drawX), ig.system.getDrawPos(y + i * lineHeight));
                }

                ctx.restore();
            }
        });

        // Reuse the ALIGN constants from ig.Font
        ig.TextFont.ALIGN = ig.Font.ALIGN;
    });
