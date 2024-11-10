/* masalygin 0.0.1 */
'use strict';

(function(factory) {

	if (typeof define === 'function' && define.amd) {

		define([], factory);

	} else {

		factory();

	}

})(function() {

	function Line(a, b) {
		this.a = a;
		this.b = b;
	}

	Line.prototype.len = function() {
		var dx = this.a.x - this.b.x,
			dy = this.a.y - this.b.y;

		return Math.sqrt(dx * dx + dy * dy);
	};

	function Triangle(a, b, c) {
		this.a = a;
		this.b = b;
		this.c = c;
	}

	Triangle.prototype.square = function() {
		var ab = (new Line(this.a, this.b)).len(),
			bc = (new Line(this.b, this.c)).len(),
			ac = (new Line(this.a, this.c)).len(),
			p = (ab + bc + ac) / 2;

		return Math.sqrt(p * (p - ab) * (p - bc) * (p - ac));
	};

	Triangle.prototype.hasPoint = function(p, d) {
		var abp = (new Triangle(this.a, this.b, p)).square(),
			acp = (new Triangle(this.a, this.c, p)).square(),
			bcp = (new Triangle(this.b, this.c, p)).square(),
			sum = abp + acp + bcp,
			dS = Math.abs(sum - this.square());

		d = (typeof d === 'undefined') ? 0 : d;

		if (dS < d) {
			return true;
		} else {
			return false;
		}
	};

	window.s3Math = {
		Line: Line,
		Triangle: Triangle
	};

	return window.s3Math;

});