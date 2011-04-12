/*
 * Paper.js
 *
 * This file is part of Paper.js, a JavaScript Vector Graphics Library,
 * based on Scriptographer.org and designed to be largely API compatible.
 * http://paperjs.org/
 * http://scriptographer.org/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * Copyright (c) 2011, Juerg Lehni & Jonathan Puckey
 * http://lehni.org/ & http://jonathanpuckey.com/
 *
 * All rights reserved.
 */

Path.inject({ statics: new function() {
	var kappa = 2 / 3 * (Math.sqrt(2) - 1);

	var ovalSegments = [
		new Segment([0, 0.5], [0, kappa ], [0, -kappa]),
		new Segment([0.5, 0], [-kappa, 0], [kappa, 0 ]),
		new Segment([1, 0.5], [0, -kappa], [0, kappa ]),
		new Segment([0.5, 1], [kappa, 0 ], [-kappa, 0])
	];

	return {
		Line: function() {
			var step = Math.floor(arguments.length / 2);
			return new Path(
				Segment.read(arguments, 0, step),
				Segment.read(arguments, step, step)
			);
		},

		Rectangle: function(rect) {
			rect = Rectangle.read(arguments);
			var path = new Path(),
				corners = ['getBottomLeft', 'getTopLeft', 'getTopRight',
						'getBottomRight'];
			for (var i = 0; i < 4; i++) {
				path.add(rect[corners[i]]());
			}
			path.closed = true;
			return path;
		},

		RoundRectangle: function(rect, size) {
			if (arguments.length == 2) {
				rect = Rectangle.read(arguments, 0, 1);
				size = Size.read(arguments, 1, 1);
			} else if (arguments.length == 6) {
				rect = Rectangle.read(arguments, 0, 4);
				size = Size.read(arguments, 4, 2);
			}
			size = Size.min(size, rect.getSize().divide(2));
			var path = new Path(),
				uSize = size.multiply(kappa * 2),
				
				bl = rect.getBottomLeft(),
				tl = rect.getTopLeft(),
				tr = rect.getTopRight(),
				br = rect.getBottomRight();

			path.add(bl.add(size.width, 0), null, [-uSize.width, 0]);
			path.add(bl.subtract(0, size.height), [0, uSize.height], null);

			path.add(tl.add(0, size.height), null, [0, -uSize.height]);
			path.add(tl.add(size.width, 0), [-uSize.width, 0], null);

			path.add(tr.subtract(size.width, 0), null, [uSize.width, 0]);
			path.add(tr.add(0, size.height), [0, -uSize.height], null);

			path.add(br.subtract(0, size.height), null, [0, uSize.height]);
			path.add(br.subtract(size.width, 0), [uSize.width, 0], null);

			path.closed = true;
			return path;
		},

		Oval: function(rect) {
			rect = Rectangle.read(arguments);
			var path = new Path(),
				topLeft = rect.getTopLeft(),
				size = new Size(rect.width, rect.height);
			for (var i = 0; i < 4; i++) {
				var segment = ovalSegments[i];
				path._add(new Segment(
					segment._point.multiply(size).add(topLeft),
					segment._handleIn.multiply(size),
					segment._handleOut.multiply(size)
				));
			}
			path.closed = true;
			return path;
		},

		Circle: function(center, radius) {
			if (arguments.length == 3) {
				center = Point.read(arguments, 0, 2);
				radius = arguments[2];
			} else {
				center = Point.read(arguments, 0, 1);
			}
			return Path.Oval(new Rectangle(center.subtract(radius),
					new Size(radius * 2, radius * 2)));
		},

		Arc: function(from, through, to) {
			var path = new Path();
			path.moveTo(from);
			path.arcTo(through, to);
			return path;
		},

		RegularPolygon: function(center, numSides, radius) {
			center = Point.read(arguments, 0);
			var path = new Path(),
				three = !(numSides % 3),
				vector = new Point(0, three ? -radius : radius),
				offset = three ? -1 : 0.5;
			for (var i = 0; i < numSides; i++) {
				var angle = (360 / numSides) * (i + offset);
				path.add(center.add(vector.rotate(angle)));
			}
			path.closed = true;
			return path;
		},
		
		Star: function(center, numPoints, radius1, radius2) {
			center = Point.read(arguments, 0);
			numPoints *= 2;
			var inner = Math.min(radius1, radius2),
				outer = Math.max(radius1, radius2),
				angle = 360 / numPoints,
				outerFirst = radius1 < radius2,
				path = new Path();
			for (var i = 0; i < numPoints; i++) {
				var radius = i % 2 == outerFirst ? outer : inner,
					vector = new Point({
						angle: -90 + angle * i,
						length: radius
					});
				path.add(center.add(vector));
			}
			path.closed = true;
			return path;
		}
	};
}});
