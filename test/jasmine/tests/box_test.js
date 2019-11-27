var Plotly = require('@lib');
var Lib = require('@src/lib');
var Plots = require('@src/plots/plots');

var Box = require('@src/traces/box');

var d3 = require('d3');
var createGraphDiv = require('../assets/create_graph_div');
var destroyGraphDiv = require('../assets/destroy_graph_div');
var failTest = require('../assets/fail_test');
var mouseEvent = require('../assets/mouse_event');
var supplyAllDefaults = require('../assets/supply_defaults');

var customAssertions = require('../assets/custom_assertions');
var assertHoverLabelContent = customAssertions.assertHoverLabelContent;

describe('Test boxes supplyDefaults', function() {
    var traceIn;
    var traceOut;
    var defaultColor = '#444';
    var supplyDefaults = Box.supplyDefaults;

    beforeEach(function() {
        traceOut = {};
    });

    it('should set visible to false when x and y are empty', function() {
        traceIn = {};
        supplyDefaults(traceIn, traceOut, defaultColor);
        expect(traceOut.visible).toBe(false);

        traceIn = {
            x: [],
            y: []
        };
        supplyDefaults(traceIn, traceOut, defaultColor, {});
        expect(traceOut.visible).toBe(false);
    });

    it('should set visible to false when x or y is empty', function() {
        traceIn = {
            x: []
        };
        supplyDefaults(traceIn, traceOut, defaultColor, {});
        expect(traceOut.visible).toBe(false);

        traceIn = {
            x: [],
            y: [1, 2, 3]
        };
        supplyDefaults(traceIn, traceOut, defaultColor, {});
        expect(traceOut.visible).toBe(false);

        traceIn = {
            y: []
        };
        supplyDefaults(traceIn, traceOut, defaultColor, {});
        expect(traceOut.visible).toBe(false);

        traceIn = {
            x: [1, 2, 3],
            y: []
        };
        supplyDefaults(traceIn, traceOut, defaultColor, {});
        expect(traceOut.visible).toBe(false);
    });

    it('should set orientation to v by default', function() {
        traceIn = {
            y: [1, 2, 3]
        };
        supplyDefaults(traceIn, traceOut, defaultColor, {});
        expect(traceOut.orientation).toBe('v');

        traceIn = {
            x: [1, 1, 1],
            y: [1, 2, 3]
        };
        supplyDefaults(traceIn, traceOut, defaultColor, {});
        expect(traceOut.orientation).toBe('v');
    });

    it('should set orientation to h when only x is supplied', function() {
        traceIn = {
            x: [1, 2, 3]
        };
        supplyDefaults(traceIn, traceOut, defaultColor, {});
        expect(traceOut.orientation).toBe('h');
    });

    it('should inherit layout.calendar', function() {
        traceIn = {
            y: [1, 2, 3]
        };
        supplyDefaults(traceIn, traceOut, defaultColor, {calendar: 'islamic'});

        // we always fill calendar attributes, because it's hard to tell if
        // we're on a date axis at this point.
        expect(traceOut.xcalendar).toBe('islamic');
        expect(traceOut.ycalendar).toBe('islamic');
    });

    it('should take its own calendars', function() {
        traceIn = {
            y: [1, 2, 3],
            xcalendar: 'coptic',
            ycalendar: 'ethiopian'
        };
        supplyDefaults(traceIn, traceOut, defaultColor, {calendar: 'islamic'});

        // we always fill calendar attributes, because it's hard to tell if
        // we're on a date axis at this point.
        expect(traceOut.xcalendar).toBe('coptic');
        expect(traceOut.ycalendar).toBe('ethiopian');
    });

    it('should not coerce point attributes when boxpoints is false', function() {
        traceIn = {
            y: [1, 1, 2],
            boxpoints: false
        };
        supplyDefaults(traceIn, traceOut, defaultColor, {});

        expect(traceOut.boxpoints).toBe(false);
        expect(traceOut.jitter).toBeUndefined();
        expect(traceOut.pointpos).toBeUndefined();
        expect(traceOut.marker).toBeUndefined();
        expect(traceOut.text).toBeUndefined();
    });

    it('should default boxpoints to suspectedoutliers when marker.outliercolor is set & valid', function() {
        traceIn = {
            y: [1, 1, 2],
            marker: {
                outliercolor: 'blue'
            }
        };
        supplyDefaults(traceIn, traceOut, defaultColor, {});
        expect(traceOut.boxpoints).toBe('suspectedoutliers');
    });

    it('should default boxpoints to suspectedoutliers when marker.line.outliercolor is set & valid', function() {
        traceIn = {
            y: [1, 1, 2],
            marker: {
                line: {outliercolor: 'blue'}
            }
        };
        supplyDefaults(traceIn, traceOut, defaultColor, {});
        expect(traceOut.boxpoints).toBe('suspectedoutliers');
        expect(traceOut.marker).toBeDefined();
        expect(traceOut.text).toBeDefined();
    });

    describe('should not coerce hovertemplate when *hoveron* does not contains *points* flag', function() {
        var ht = '--- %{y}';

        it('- case hoveron:points', function() {
            traceIn = {
                y: [1, 1, 2],
                hoveron: 'points',
                hovertemplate: ht
            };
            supplyDefaults(traceIn, traceOut, defaultColor, {});
            expect(traceOut.hovertemplate).toBe(ht);
        });

        it('- case hoveron:points+boxes', function() {
            traceIn = {
                y: [1, 1, 2],
                hoveron: 'points+boxes',
                hovertemplate: ht
            };
            supplyDefaults(traceIn, traceOut, defaultColor, {});
            expect(traceOut.hovertemplate).toBe(ht);
        });

        it('- case hoveron:boxes', function() {
            traceIn = {
                y: [1, 1, 2],
                hoveron: 'boxes',
                hovertemplate: ht
            };
            supplyDefaults(traceIn, traceOut, defaultColor, {});
            expect(traceOut.hovertemplate).toBe(undefined);
        });
    });

    it('should not include alignementgroup/offsetgroup when boxmode is not *group*', function() {
        var gd = {
            data: [{type: 'box', y: [1], alignmentgroup: 'a', offsetgroup: '1'}],
            layout: {boxmode: 'group'}
        };

        supplyAllDefaults(gd);
        expect(gd._fullData[0].alignmentgroup).toBe('a', 'alignementgroup');
        expect(gd._fullData[0].offsetgroup).toBe('1', 'offsetgroup');

        gd.layout.boxmode = 'overlay';
        supplyAllDefaults(gd);
        expect(gd._fullData[0].alignmentgroup).toBe(undefined, 'alignementgroup');
        expect(gd._fullData[0].offsetgroup).toBe(undefined, 'offsetgroup');
    });

    describe('q1/median/q3 API signature', function() {
        function _check(msg, t, exp) {
            var gd = { data: [Lib.extendFlat({type: 'box'}, t)] };
            supplyAllDefaults(gd);
            for(var k in exp) {
                expect(gd._fullData[0][k]).toBe(exp[k], msg + ' | ' + k);
            }
        }

        it('should result in correct orientation results', function() {
            _check('insufficient (no median)', {
                q1: [1],
                q3: [3]
            }, {
                visible: false,
                orientation: undefined,
                _length: undefined
            });
            // TODO would need to add dx and dy to work correctly
            // _check('base', {
            //     q1: [1],
            //     median: [2],
            //     q3: [3]
            // }, {
            //     visible: true,
            //     orientation: 'v',
            //     _length: 1
            // });
            _check('with set x', {
                x: [0],
                q1: [1],
                median: [2],
                q3: [3]
            }, {
                visible: true,
                orientation: 'v',
                _length: 1
            });
            _check('with set y', {
                y: [0],
                q1: [1],
                median: [2],
                q3: [3]
            }, {
                visible: true,
                orientation: 'h',
                _length: 1
            });
        });

        it('should coerce lowerfence and upperfence', function() {
            var lf = [-1];
            var uf = [5];

            _check('insufficient (no median)', {
                q1: [1],
                q3: [3],
                lowerfence: lf,
                upperfence: uf
            }, {
                visible: false,
                lowerfence: undefined,
                upperfence: undefined
            });
            _check('x/y signature', {
                x: [0],
                y: [1],
                lowerfence: lf,
                upperfence: uf
            }, {
                visible: true,
                lowerfence: undefined,
                upperfence: undefined
            });
            _check('base', {
                x: [0],
                q1: [1],
                median: [2],
                q3: [3],
                lowerfence: lf,
                upperfence: uf
            }, {
                visible: true,
                lowerfence: lf,
                upperfence: uf
            });
        });

        it('should lead to correct boxmean default', function() {
            var mean = [2.2];
            var sd = [0.1];

            _check('x/y signature', {
                x: [0],
                y: [1],
            }, {
                boxmean: false
            });
            _check('base', {
                x: [0],
                q1: [1],
                median: [2],
                q3: [3]
            }, {
                boxmean: false
            });
            _check('with mean set', {
                x: [0],
                q1: [1],
                median: [2],
                q3: [3],
                mean: mean
            }, {
                boxmean: true,
                mean: mean
            });
            _check('with mean and sd set', {
                x: [0],
                q1: [1],
                median: [2],
                q3: [3],
                mean: mean,
                sd: sd
            }, {
                boxmean: 'sd',
                mean: mean,
                sd: sd
            });
        });

        it('should lead to correct notched default', function() {
            var ns = [0.05];

            _check('x/y signature', {
                x: [0],
                y: [1],
                notchwidth: 0.1
            }, {
                notched: true,
                notchwidth: 0.1
            });
            _check('base', {
                x: [0],
                q1: [1],
                median: [2],
                q3: [3],
                notchwidth: 0.1
            }, {
                notched: false,
                notchwidth: undefined
            });
            _check('with notchspan set', {
                x: [0],
                q1: [1],
                median: [2],
                q3: [3],
                notchspan: ns
            }, {
                notchspan: ns,
                notched: true,
                notchwidth: 0.25
            });
        });

        it('should lead to correct boxpoints default', function() {
            var outliers = [[-10, 10]];

            _check('with outliers not set', {
                x: [0],
                q1: [1],
                median: [2],
                q3: [3]
            }, {
                outliers: undefined,
                boxpoints: false
            });
            _check('with outliers set', {
                x: [0],
                q1: [1],
                median: [2],
                q3: [3],
                outliers: outliers
            }, {
                outliers: outliers,
                boxpoints: 'outliers'
            });
            _check('with outliers set and boxpoints set to *all*', {
                x: [0],
                q1: [1],
                median: [2],
                q3: [3],
                outliers: outliers,
                boxpoints: 'all'
            }, {
                outliers: outliers,
                boxpoints: 'outliers'
            });
            _check('with outliers set and boxpoints set to *suspectedoutliers*', {
                x: [0],
                q1: [1],
                median: [2],
                q3: [3],
                outliers: outliers,
                boxpoints: 'suspectedoutliers'
            }, {
                outliers: outliers,
                boxpoints: 'outliers'
            });
        });
    });
});

describe('Test box hover:', function() {
    var gd;

    afterEach(destroyGraphDiv);

    function run(specs) {
        gd = createGraphDiv();

        var fig = Lib.extendDeep(
            {width: 700, height: 500},
            specs.mock || require('@mocks/box_grouped.json')
        );

        if(specs.patch) {
            fig = specs.patch(fig);
        }

        var pos = specs.pos || [200, 200];

        return Plotly.plot(gd, fig).then(function() {
            mouseEvent('mousemove', pos[0], pos[1]);
            assertHoverLabelContent(specs, specs.desc);
        });
    }

    [{
        desc: 'base',
        nums: ['median: 0.55', 'min: 0', 'q1: 0.3', 'q3: 0.6', 'max: 0.7'],
        name: ['radishes', '', '', '', ''],
        axis: 'day 1'
    }, {
        desc: 'with mean',
        patch: function(fig) {
            fig.data.forEach(function(trace) {
                trace.boxmean = true;
            });
            return fig;
        },
        nums: ['median: 0.55', 'min: 0', 'q1: 0.3', 'q3: 0.6', 'max: 0.7', 'mean: 0.45'],
        name: ['radishes', '', '', '', '', ''],
        axis: 'day 1'
    }, {
        desc: 'with sd',
        patch: function(fig) {
            fig.data.forEach(function(trace) {
                trace.boxmean = 'sd';
            });
            return fig;
        },
        nums: [
            'median: 0.55', 'min: 0', 'q1: 0.3', 'q3: 0.6', 'max: 0.7',
            'mean ± σ: 0.45 ± 0.2362908'
        ],
        name: ['radishes', '', '', '', '', ''],
        axis: 'day 1'
    }, {
        desc: 'with boxpoints fences',
        mock: require('@mocks/boxplots_outliercolordflt.json'),
        pos: [350, 200],
        nums: [
            'median: 8.15', 'min: 0.75', 'q1: 6.8',
            'q3: 10.25', 'max: 23.25', 'lower fence: 5.25', 'upper fence: 12'
        ],
        name: ['', '', '', '', '', '', ''],
        axis: 'trace 0'
    }, {
        desc: 'with overlaid boxes',
        patch: function(fig) {
            fig.layout.boxmode = 'overlay';
            return fig;
        },
        nums: [
            'q1: 0.3', 'median: 0.45', 'q3: 0.6', 'max: 1', 'median: 0.55', 'min: 0', 'q1: 0.1',
            'q3: 0.6', 'max: 0.7', 'median: 0.45', 'q1: 0.2', 'q3: 0.6', 'max: 0.9'
        ],
        name: [
            '', 'kale', '', '', 'radishes', '', '',
            '', '', 'carrots', '', '', ''
        ],
        axis: 'day 1'
    }, {
        desc: 'hoveron points | hovermode closest',
        patch: function(fig) {
            fig.data.forEach(function(trace) {
                trace.boxpoints = 'all';
                trace.hoveron = 'points';
            });
            fig.layout.hovermode = 'closest';
            fig.layout.xaxis = {range: [-0.565, 1.5]};
            return fig;
        },
        nums: '(day 1, 0.7)',
        name: 'radishes'
    }, {
        desc: 'hoveron points | hovermode x',
        patch: function(fig) {
            fig.data.forEach(function(trace) {
                trace.boxpoints = 'all';
                trace.hoveron = 'points';
            });
            fig.layout.hovermode = 'x';
            fig.layout.xaxis = {range: [-0.565, 1.5]};
            return fig;
        },
        nums: '0.7',
        name: 'radishes',
        axis: 'day 1'
    }, {
        desc: 'hoveron boxes+points | hovermode x (hover on box only - same result as base)',
        patch: function(fig) {
            fig.data.forEach(function(trace) {
                trace.boxpoints = 'all';
                trace.hoveron = 'points+boxes';
            });
            fig.layout.hovermode = 'x';
            fig.layout.xaxis = {range: [-0.565, 1.5]};
            return fig;
        },
        pos: [215, 200],
        nums: ['median: 0.55', 'min: 0', 'q1: 0.3', 'q3: 0.6', 'max: 0.7'],
        name: ['radishes', '', '', '', ''],
        axis: 'day 1'
    }, {
        desc: 'hoveron boxes+points | hovermode x (box AND closest point)',
        patch: function(fig) {
            fig.data.forEach(function(trace) {
                trace.boxpoints = 'all';
                trace.hoveron = 'points+boxes';
                trace.pointpos = 0;
            });
            fig.layout.hovermode = 'x';
            return fig;
        },
        nums: ['0.6', 'median: 0.55', 'min: 0', 'q1: 0.3', 'q3: 0.6', 'max: 0.7'],
        name: ['radishes', 'radishes', '', '', '', ''],
        axis: 'day 1'
    }, {
        desc: 'text items on hover',
        patch: function(fig) {
            fig.data.forEach(function(trace) {
                trace.boxpoints = 'all';
                trace.hoveron = 'points';
                trace.text = trace.y.map(function(v) { return 'look:' + v; });
            });
            fig.layout.hovermode = 'closest';
            fig.layout.xaxis = {range: [-0.565, 1.5]};
            return fig;
        },
        nums: '(day 1, 0.7)\nlook:0.7',
        name: 'radishes'
    }, {
        desc: 'only text items on hover',
        patch: function(fig) {
            fig.data.forEach(function(trace) {
                trace.boxpoints = 'all';
                trace.hoveron = 'points';
                trace.text = trace.y.map(function(v) { return 'look:' + v; });
                trace.hoverinfo = 'text';
            });
            fig.layout.hovermode = 'closest';
            fig.layout.xaxis = {range: [-0.565, 1.5]};
            return fig;
        },
        nums: 'look:0.7',
        name: ''
    }, {
        desc: 'only hovertext items on hover',
        patch: function(fig) {
            fig.data.forEach(function(trace) {
                trace.boxpoints = 'all';
                trace.hoveron = 'points';
                trace.text = trace.y.map(function(v) { return 'NOT THIS:' + v; });
                trace.hovertext = trace.y.map(function(v) { return 'look:' + v; });
                trace.hoverinfo = 'text';
            });
            fig.layout.hovermode = 'closest';
            fig.layout.xaxis = {range: [-0.565, 1.5]};
            return fig;
        },
        nums: 'look:0.7',
        name: ''
    }, {
        desc: 'orientation:h | hovermode:y',
        mock: require('@mocks/box_grouped_horz.json'),
        pos: [430, 130],
        nums: [
            'max: 1', 'mean ± σ: 0.6833333 ± 0.2409472', 'min: 0.3',
            'q1: 0.5', 'q3: 0.9', 'median: 0.7'],
        name: ['', '', '', '', '', 'carrots'],
        axis: 'day 2',
        hOrder: [0, 4, 5, 1, 3, 2]
    }, {
        desc: 'orientation:h | hovermode:closest',
        mock: require('@mocks/box_grouped_horz.json'),
        patch: function(fig) {
            fig.layout.hovermode = 'closest';
            return fig;
        },
        pos: [430, 130],
        nums: [
            '(max: 1, day 2)', '(mean ± σ: 0.6833333 ± 0.2409472, day 2)', '(min: 0.3, day 2)',
            '(q1: 0.5, day 2)', '(q3: 0.9, day 2)', '(median: 0.7, day 2)'],
        name: ['', '', '', '', '', 'carrots'],
        hOrder: [0, 4, 5, 1, 3, 2]
    }, {
        desc: 'on boxpoints with numeric positions | hovermode:closest',
        mock: {
            data: [{
                type: 'box',
                boxpoints: 'all',
                jitter: 0,
                x: [2, 2, 2, 2, 2],
                y: [13.1, 14.2, 14, 13, 13.3]
            }],
            layout: {
                hovermode: 'closest',
                xaxis: {range: [1.3775, 2.5]}
            }
        },
        pos: [202, 335],
        nums: '(2, 13.1)',
        name: ''
    }, {
        desc: 'with hovertemplate for points',
        patch: function(fig) {
            fig.data.forEach(function(trace) {
                trace.boxpoints = 'all';
                trace.hoveron = 'points';
                trace.hovertemplate = '%{y}<extra>pt #%{pointNumber}</extra>';
            });
            fig.layout.hovermode = 'closest';
            return fig;
        },
        nums: '0.6',
        name: 'pt #0'
    }, {
        desc: 'when zoomed in, within q1-q3 making min/q1 and max/q3 overlap',
        mock: {
            data: [{
                type: 'box',
                y: [1, 2, 2, 3]
            }],
            layout: {
                yaxis: {range: [1.6, 2.4]},
                width: 400,
                height: 400
            }
        },
        pos: [200, 200],
        nums: ['median: 2', 'q1: 1.5', 'q3: 2.5', 'max: 3', 'min: 1'],
        name: ['', '', '', '', ''],
        axis: 'trace 0'
    }].forEach(function(specs) {
        it('should generate correct hover labels ' + specs.desc, function(done) {
            run(specs).catch(failTest).then(done);
        });
    });
});

describe('Box edge cases', function() {
    var gd;

    beforeEach(function() {
        gd = createGraphDiv();
    });

    afterEach(destroyGraphDiv);

    it('does not barf on a single outlier with jitter', function(done) {
        var trace = {
            boxpoints: 'outliers',
            jitter: 0.7,
            type: 'box',
            y: [46.505, 0.143, 0.649, 0.059, 513, 90, 234]
        };

        Plotly.newPlot(gd, [trace])
        .then(function() {
            var outliers = [];
            gd.calcdata[0][0].pts.forEach(function(pt) {
                if(pt.x !== undefined) outliers.push(pt);
            });
            expect(outliers.length).toBe(1);
            expect(outliers[0].x).toBe(0);
        })
        .catch(failTest)
        .then(done);
    });
});

describe('Test box restyle:', function() {
    var gd;

    beforeEach(function() {
        gd = createGraphDiv();
    });

    afterEach(destroyGraphDiv);

    it('should be able to add/remove innner parts', function(done) {
        var fig = Lib.extendDeep({}, require('@mocks/box_plot_jitter.json'));
        // start with just 1 box
        delete fig.data[0].boxpoints;

        function _assertOne(msg, exp, trace3, k, query) {
            expect(trace3.selectAll(query).size())
                .toBe(exp[k] || 0, k + ' - ' + msg);
        }

        function _assert(msg, exp) {
            var trace3 = d3.select(gd).select('.boxlayer > .trace');
            _assertOne(msg, exp, trace3, 'boxCnt', 'path.box');
            _assertOne(msg, exp, trace3, 'meanlineCnt', 'path.mean');
            _assertOne(msg, exp, trace3, 'ptsCnt', 'path.point');
        }

        Plotly.plot(gd, fig)
        .then(function() {
            _assert('base', {boxCnt: 1});
        })
        .then(function() { return Plotly.restyle(gd, 'boxmean', true); })
        .then(function() {
            _assert('with meanline', {boxCnt: 1, meanlineCnt: 1});
        })
        .then(function() { return Plotly.restyle(gd, 'boxmean', 'sd'); })
        .then(function() {
            _assert('with mean+sd line', {boxCnt: 1, meanlineCnt: 1});
        })
        .then(function() { return Plotly.restyle(gd, 'boxpoints', 'all'); })
        .then(function() {
            _assert('with mean+sd line + pts', {boxCnt: 1, meanlineCnt: 1, ptsCnt: 9});
        })
        .then(function() { return Plotly.restyle(gd, 'boxmean', false); })
        .then(function() {
            _assert('with pts', {boxCnt: 1, ptsCnt: 9});
        })
        .catch(failTest)
        .then(done);
    });

    it('should update axis range accordingly on calc edits', function(done) {
        function _assert(msg, xrng, yrng) {
            var fullLayout = gd._fullLayout;
            expect(fullLayout.xaxis.range).toBeCloseToArray(xrng, 2, msg + ' xrng');
            expect(fullLayout.yaxis.range).toBeCloseToArray(yrng, 2, msg + ' yrng');
        }

        Plotly.plot(gd, [{
            type: 'box',
            y: [0, 1, 1, 1, 1, 2, 2, 3, 5, 6, 10]
        }], {
            xaxis: {range: [-0.5, 0.5]},
            yaxis: {range: [-0.5, 10.5]}
        })
        .then(function() {
            _assert('auto rng / no boxpoints', [-0.5, 0.5], [-0.5, 10.5]);
            return Plotly.restyle(gd, 'boxpoints', 'all');
        })
        .then(function() {
            _assert('set rng / all boxpoints', [-0.5, 0.5], [-0.5, 10.5]);
            return Plotly.relayout(gd, {
                'xaxis.autorange': true,
                'yaxis.autorange': true
            });
        })
        .then(function() {
            _assert('auto rng / all boxpoints', [-0.5055, 0.5], [-0.555, 10.555]);
            return Plotly.restyle(gd, 'boxpoints', false);
        })
        .then(function() {
            _assert('auto rng / no boxpoints', [-0.5, 0.5], [-0.555, 10.555]);
        })
        .catch(failTest)
        .then(done);
    });

    it('should be able to change axis range when the number of distinct positions changes', function(done) {
        function _assert(msg, xrng, yrng) {
            var fullLayout = gd._fullLayout;
            expect(fullLayout.xaxis.range).toBeCloseToArray(xrng, 2, msg + ' xrng');
            expect(fullLayout.yaxis.range).toBeCloseToArray(yrng, 2, msg + ' yrng');
        }

        Plotly.plot(gd, [{
            type: 'box',
            width: 0.4,
            y: [0, 5, 7, 8],
            y0: 0
        }, {
            type: 'box',
            y: [0, 5, 7, 8],
            y0: 0.1
        }])
        .then(function() {
            _assert('base', [-0.289, 1.5], [-0.444, 8.444]);
            return Plotly.restyle(gd, 'visible', [true, 'legendonly']);
        })
        .then(function() {
            _assert('only trace0 visible', [-0.2222, 0.2222], [-0.444, 8.444]);
            return Plotly.restyle(gd, 'visible', ['legendonly', true]);
        })
        .then(function() {
            _assert('only trace1 visible', [-0.5, 0.5], [-0.444, 8.444]);
        })
        .catch(failTest)
        .then(done);
    });
});

describe('Test box calc', function() {
    var gd;

    function _calc(attrs, layout) {
        gd = {
            data: [Lib.extendFlat({type: 'box'}, attrs)],
            layout: layout || {},
            calcdata: []
        };
        supplyAllDefaults(gd);
        Plots.doCalcdata(gd);
        return gd.calcdata[0];
    }

    it('should compute q1/q3 depending on *quartilemethod*', function() {
        // samples from https://en.wikipedia.org/wiki/Quartile
        var specs = {
            // N is odd and is spanned by (4n+3)
            odd: {
                sample: [6, 7, 15, 36, 39, 40, 41, 42, 43, 47, 49],
                methods: {
                    linear: {q1: 20.25, q3: 42.75},
                    exclusive: {q1: 15, q3: 43},
                    inclusive: {q1: 25.5, q3: 42.5}
                }
            },
            // N is odd and is spanned by (4n+1)
            odd2: {
                sample: [6, 15, 36, 39, 40, 42, 43, 47, 49],
                methods: {
                    linear: {q1: 30.75, q3: 44},
                    exclusive: {q1: 25.5, q3: 45},
                    inclusive: {q1: 36, q3: 43}
                }
            },
            // N is even
            even: {
                sample: [7, 15, 36, 39, 40, 41],
                methods: {
                    linear: {q1: 15, q3: 40},
                    exclusive: {q1: 15, q3: 40},
                    inclusive: {q1: 15, q3: 40}
                }
            },
            // samples from http://jse.amstat.org/v14n3/langford.html
            s4: {
                sample: [1, 2, 3, 4],
                methods: {
                    linear: {q1: 1.5, q3: 3.5},
                    exclusive: {q1: 1.5, q3: 3.5},
                    inclusive: {q1: 1.5, q3: 3.5}
                }
            },
            s5: {
                sample: [1, 2, 3, 4, 5],
                methods: {
                    linear: {q1: 1.75, q3: 4.25},
                    exclusive: {q1: 1.5, q3: 4.5},
                    inclusive: {q1: 2, q3: 4}
                }
            },
            s6: {
                sample: [1, 2, 3, 4, 5, 6],
                methods: {
                    linear: {q1: 2, q3: 5},
                    exclusive: {q1: 2, q3: 5},
                    inclusive: {q1: 2, q3: 5}
                }
            },
            s7: {
                sample: [1, 2, 3, 4, 5, 6, 7],
                methods: {
                    linear: {q1: 2.25, q3: 5.75},
                    exclusive: {q1: 2, q3: 6},
                    inclusive: {q1: 2.5, q3: 5.5}
                }
            }
        };

        for(var name in specs) {
            var spec = specs[name];

            for(var m in spec.methods) {
                var cd = _calc({y: spec.sample, quartilemethod: m});
                expect(cd[0].q1).toBe(spec.methods[m].q1, ['q1', m, name].join(' | '));
                expect(cd[0].q3).toBe(spec.methods[m].q3, ['q3', m, name].join(' | '));
            }
        }
    });

    describe('with q1/median/q3 API signature inputs', function() {
        function base(patch) {
            return Lib.extendFlat({
                x: [1, 2],
                lowerfence: [0, 1],
                q1: [1, 2],
                median: [2, 3],
                q3: [3, 4],
                upperfence: [4, 5]
            }, patch);
        }

        function _assert(msg, d, keys, exp) {
            var actual = keys.map(function(k) { return d[k]; });
            expect(actual).withContext(keys.join(', ') + ' | ' + msg).toEqual(exp);
        }

        it('should skip box corresponding to non-numeric positions', function() {
            var cd = _calc(base({x: [null, 2]}));
            expect(cd.length).toBe(1, 'has length 1');
            _assert('', cd[0],
                ['x', 'lf', 'q1', 'med', 'q3', 'uf'],
                [2, 1, 2, 3, 4, 5]
            );
        });

        it('should warn when q1/median/q3 values are invalid', function() {
            spyOn(Lib, 'warn');

            var cd = _calc(base({q1: [null, 2]}));
            _assert('non-numeric q1', cd[0],
                ['lf', 'q1', 'med', 'q3', 'uf'],
                [2, 2, 2, 2, 2]
            );
            cd = _calc(base({q1: [10, 2]}));
            _assert('invalid q1', cd[0],
                ['lf', 'q1', 'med', 'q3', 'uf'],
                [2, 2, 2, 2, 2]
            );

            cd = _calc(base({q3: [3, null]}));
            _assert('non-numeric q3', cd[1],
                ['lf', 'q1', 'med', 'q3', 'uf'],
                [3, 3, 3, 3, 3]
            );
            cd = _calc(base({q3: [3, -10]}));
            _assert('invalid q3', cd[1],
                ['lf', 'q1', 'med', 'q3', 'uf'],
                [3, 3, 3, 3, 3]
            );

            cd = _calc(base({median: [null, 3]}));
            _assert('non-numeric median', cd[0],
                ['lf', 'q1', 'med', 'q3', 'uf'],
                [2, 2, 2, 2, 2]
            );
            cd = _calc(base({median: [null, 3], q1: [null, 2]}));
            _assert('non-numeric median AND q1', cd[0],
                ['lf', 'q1', 'med', 'q3', 'uf'],
                [3, 3, 3, 3, 3]
            );
            cd = _calc(base({median: [null, 3], q3: [null, 4]}));
            _assert('non-numeric median AND q3', cd[0],
                ['lf', 'q1', 'med', 'q3', 'uf'],
                [1, 1, 1, 1, 1]
            );
            cd = _calc(base({median: [null, 3], q1: [null, 2], q3: [null, 4]}));
            _assert('non-numeric median, q1 and q3', cd[0],
                ['lf', 'q1', 'med', 'q3', 'uf'],
                [0, 0, 0, 0, 0]
            );

            expect(Lib.warn).toHaveBeenCalledTimes(8);
        });

        it('should set *lf* to *q1* when input is invalid', function() {

        });

        it('should set *uf* to *q3* when input is invalid', function() {

        });

        it('should fill *mean* and *sd*', function() {

        });

        it('should set notchspan to 0 when input is invalid', function() {

        });

        it('should fill in *pts* and *pts2* arrays with outlier items', function() {
        });

        it('should compute correct *min* and *max* values', function() {

        });
    });
});
