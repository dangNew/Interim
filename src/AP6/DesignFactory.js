// Define the factory object
const shapeFactory = {
    createShape: function(type, ...args) {
      switch(type) {
        case 'circle':
          return this.createCircle(...args);
        case 'square':
          return this.createSquare(...args);
        case 'triangle':
          return this.createTriangle(...args);
        default:
          throw new Error('Unknown shape type');
      }
    },
  
    createCircle: function(radius) {
      return {
        type: 'circle',
        radius: radius,
        draw: function() {
          console.log(`Drawing a circle with radius ${this.radius}`);
        }
      };
    },
  
    createSquare: function(sideLength) {
      return {
        type: 'square',
        sideLength: sideLength,
        draw: function() {
          console.log(`Drawing a square with side length ${this.sideLength}`);
        }
      };
    },
  
    createTriangle: function(base, height) {
      return {
        type: 'triangle',
        base: base,
        height: height,
        draw: function() {
          console.log(`Drawing a triangle with base ${this.base} and height ${this.height}`);
        }
      };
    }
  };
  
  // Create shapes using the factory object
  const circle = shapeFactory.createShape('circle', 5);
  const square = shapeFactory.createShape('square', 4);
  const triangle = shapeFactory.createShape('triangle', 3, 6);
  
  // Draw the shapes
  circle.draw(); // Output: Drawing a circle with radius 5
  square.draw(); // Output: Drawing a square with side length 4
  triangle.draw(); // Output: Drawing a triangle with base 3 and height 6
  