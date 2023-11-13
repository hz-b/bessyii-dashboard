
    function renderCharts(selectedValue, magnetName, fitReadyDataFetched, estimatedAnglesFetched) {

        if (selectedValue == "magnet_offsets") {
            // Extract the necessary data from the fetched data
            const perMagnetData = estimatedAnglesFetched.per_magnet;

            // Extract x and y bpm_offsets for plotting
            const xOffsets = [];
            const yOffsets = [];
            const xOffsetErrors = [];
            const yOffsetErrors = [];
            const magnetNames = [];

            for (const magnetName in perMagnetData) {
                if (perMagnetData.hasOwnProperty(magnetName)) {
                    const magnet = perMagnetData[magnetName];
                    const xOffsetsData = magnet.x.offset;
                    const yOffsetsData = magnet.y.offset;

                    const pscale = 1000;
                    if (xOffsetsData && yOffsetsData) {
                        xOffsets.push(xOffsetsData.value * pscale);
                        yOffsets.push(yOffsetsData.value * pscale);
                        xOffsetErrors.push(xOffsetsData.std * pscale);
                        yOffsetErrors.push(yOffsetsData.std * pscale);
                        magnetNames.push(magnet.name); // Use the 'name' field
                    }
                }
            }

            // Create traces for x and y bpm_offsets
            const xOffsetsTrace = {
                name: 'quad x offset',
                x: magnetNames,
                y: xOffsets,
                error_y: {
                    type: 'data',
                    array: xOffsetErrors,
                    visible: true
                },
                type: 'scatter'
            };

            const yOffsetsTrace = {
                name: 'quad y offset',
                x: magnetNames,
                y: yOffsets,
                type: 'scatter',
                error_y: {
                    type: 'data',
                    array: yOffsetErrors,
                    visible: true
                },
            };

            // Create the layout for the plot
            const layout_plot_1 = {
                title: 'BPM Offsets for X and Y Planes',
                xaxis: {title: 'Magnet Name'},
                yaxis: {title: 'Offset Value x,y [mm]'}
            };

            // Combine the traces
            const data_plot_1 = [xOffsetsTrace, yOffsetsTrace];


            // Initialize arrays to store average x and y BPM offsets for each BPM
            const averageXBpmOffsets = {};
            const averageYBpmOffsets = {};

            // Loop through each magnet data and accumulate BPM offsets for each BPM
            for (const magnetName in perMagnetData) {
                if (perMagnetData.hasOwnProperty(magnetName)) {
                    const magnet = perMagnetData[magnetName];
                    const xBpmOffsetsData = magnet.x.bpm_offsets;
                    const yBpmOffsetsData = magnet.y.bpm_offsets;

                    // Accumulate X BPM offsets for each BPM
                    for (const bpmName in xBpmOffsetsData) {
                        if (!averageXBpmOffsets[bpmName]) {
                            averageXBpmOffsets[bpmName] = [];
                        }
                        averageXBpmOffsets[bpmName].push(xBpmOffsetsData[bpmName].value); // Multiply by 1000 to convert to mm
                    }

                    // Accumulate Y BPM offsets for each BPM
                    for (const bpmName in yBpmOffsetsData) {
                        if (!averageYBpmOffsets[bpmName]) {
                            averageYBpmOffsets[bpmName] = [];
                        }
                        averageYBpmOffsets[bpmName].push(yBpmOffsetsData[bpmName].value); // Multiply by 1000 to convert to mm
                    }
                }
            }

            function getStatisticalMomenta(array) {
                const n = array.length
                const mean = array.reduce((a, b) => a + b) / n
                const std = Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
                return [mean, std]
            }

            // Calculate average X and Y BPM offsets for each BPM
            const bpmNames = Object.keys(averageXBpmOffsets);
            const statsXBpmValues = bpmNames.map(bpmName => {
                return getStatisticalMomenta(averageXBpmOffsets[bpmName])
            })
            const statsYBpmValues = bpmNames.map(bpmName => {
                return getStatisticalMomenta(averageYBpmOffsets[bpmName])
            })
            const pscale = 1e3 // meter to milli meter
            const paverageXBpmValues = statsXBpmValues.map((m) => m[0] * pscale)
            const pstdXBpmValues = statsXBpmValues.map((m) => m[1] * pscale)
            const paverageYBpmValues = statsYBpmValues.map((m) => m[0] * pscale)
            const pstdYBpmValues = statsYBpmValues.map((m) => m[1] * pscale)
            // Create traces for average X and Y BPM offsets
            const averageXBpmOffsetTrace = {
                x: bpmNames,
                y: paverageXBpmValues,
                error_y: {
                    type: 'data',
                    array: pstdXBpmValues,
                    visible: true
                },
                type: 'scatter',
                name: 'x: average  BPM offset [mm]',
                marker: {color: 'blue'},
            };
            const averageYBpmOffsetTrace = {
                x: bpmNames,
                y: paverageYBpmValues,
                error_y: {
                    type: 'data',
                    array: pstdYBpmValues,
                    visible: true
                },
                type: 'scatter',
                name: 'y: average BPM offset [mm]',
                marker: {color: 'green'},
            };

            // Create the layout for the plot
            const layout_plot_2 = {
                title: 'Average BPM Offsets for X and Y Planes (Grouped by BPM)',
                xaxis: {title: 'BPM Name'},
                yaxis: {title: 'Average Offset Value (mm)'}
                // barmode: 'group', // To group the bars for each BPM
            };
            // Combine the traces
            const data_plot_2 = [averageXBpmOffsetTrace, averageYBpmOffsetTrace];



            // Initialize arrays to store individual x and y offsets for all magnets
            const offsetsX = [];
            const offsetsY = [];
            const magnetNames_ = [];

            // Loop through each magnet data and calculate individual offsets
            for (const magnetName in perMagnetData) {
                if (perMagnetData.hasOwnProperty(magnetName)) {
                    const magnet = perMagnetData[magnetName];
                    const xOffsetsData = magnet.x.offset;
                    const yOffsetsData = magnet.y.offset;

                    const pscale = 1000;
                    if (xOffsetsData && yOffsetsData) {
                        const individualXOffset = xOffsetsData.value * pscale;
                        const individualYOffset = yOffsetsData.value * pscale;
                        offsetsX.push(individualXOffset);
                        offsetsY.push(individualYOffset);
                        magnetNames_.push(magnet.name); // Use the 'name' field
                    }
                }
            }

            // Calculate average offsets for x and y planes
            const averageXOffset = xOffsets.reduce((acc, curr) => acc + curr, 0) / xOffsets.length;
            const averageYOffset = yOffsets.reduce((acc, curr) => acc + curr, 0) / yOffsets.length;

            // Create traces for individual x and y offsets as grouped bar charts
            const offsetsTraceX = {
                x: magnetNames_,
                y: xOffsets,
                type: 'bar',
                name: 'Individual X Offsets (mm)',
                marker: {color: 'blue'},
            };

            const offsetsTraceY = {
                x: magnetNames_,
                y: yOffsets,
                type: 'bar',
                name: 'Individual Y Offsets (mm)',
                marker: {color: 'orange'},
            };

            // Create traces for average x and y offsets as lines
            const averageXOffsetTrace = {
                x: magnetNames_,
                y: Array(magnetNames.length).fill(averageXOffset),
                type: 'scatter',
                mode: 'lines',
                name: 'Average X Offset (mm)',
                line: {color: 'green', width: 3},
            };

            const averageYOffsetTrace = {
                x: magnetNames_,
                y: Array(magnetNames_.length).fill(averageYOffset),
                type: 'scatter',
                mode: 'lines',
                name: 'Average Y Offset (mm)',
                line: {color: 'red', width: 3},
            };

            // Create the layout for the plot
            const layout_plot_3 = {
                title: 'Average and Individual BPM Offsets for X and Y Planes',
                xaxis: {title: 'Magnet Name'},
                yaxis: {title: 'Offset Value (mm)'},
                barmode: 'group', // To group the bars for each magnet
            };

            // Combine the traces
            const data_plot_3 = [offsetsTraceX, offsetsTraceY, averageXOffsetTrace, averageYOffsetTrace];

                        const m2mm = 1000
            // Extract the necessary data from the fetched data for the first magnet
            const firstMagnetData = Object.values(estimatedAnglesFetched.per_magnet).find(magnet => magnet.name === magnetName)

            // Extract BPM names and scaled BPM offsets for the x and y planes (from fit)
            const bpmNamesX = Object.keys(firstMagnetData.x.bpm_offsets);
            const xBpmOffsets = bpmNamesX.map(bpmName => firstMagnetData.x.bpm_offsets[bpmName].value);
            const bpmNamesY = Object.keys(firstMagnetData.y.bpm_offsets);
            const yBpmOffsets = bpmNamesY.map(bpmName => firstMagnetData.y.bpm_offsets[bpmName].value);


            const yOffset = firstMagnetData.y.offset.value; // Scale by 1000
            const xOffset = firstMagnetData.x.offset.value; // Scale by 1000

            // Create traces for x and y BPM offsets as separate lines
            const xBpmOffsetsTrace = {
                x: bpmNamesX,
                y: xBpmOffsets,
                mode: 'lines+markers',
                name: 'X BPM Offsets (scaled)',
                line: {color: 'orange'}, // Orange color
            };

            const yBpmOffsetsTrace = {
                x: bpmNamesY,
                y: yBpmOffsets,
                mode: 'lines+markers',
                name: 'Y BPM Offsets (scaled)',
                line: {color: 'blue'}, // Blue color
            };

            // Create the layout for the plot
            const layout_plot_4 = {
                title: 'BPM Offsets and X, Y Offsets: ' + magnetName,
                xaxis: {title: 'BPM Name / Offset Type'},
                yaxis: {title: 'Offset Value'},
            };

            // Combine the traces
            const data_plot_4 = [xBpmOffsetsTrace, yBpmOffsetsTrace];
            // Create the plot
            Plotly.newPlot('plot1', data_plot_1, layout_plot_1);
            Plotly.newPlot('plot2', data_plot_2, layout_plot_2);
            Plotly.newPlot('plot3', data_plot_3, layout_plot_3);
            Plotly.newPlot('plot4', data_plot_4, layout_plot_4);
        }
        else if (selectedValue == "Plot 2") {
            //
            const fitReadyPerMagnetData = Object.values(fitReadyDataFetched).find(magnet => magnet.name === magnetName);
            // loop over excitations ...
            const indices = Array.from({ length: 10 }, (_, i) => i);
            // Initialize an empty array to store traces
            const tracesX = [];
            const tracesY = [];
            const tracesXDiff = [];
            const tracesYDiff = [];
            indices.forEach(idx => {
                const excitation = fitReadyPerMagnetData['excitations'][idx] // current applied to the magnet
                const step = fitReadyPerMagnetData['steps'][idx] // so that one can see if that"s start or end data
                const bpmReadingX = fitReadyPerMagnetData['x'][idx]['data']
                const bpmReadingY = fitReadyPerMagnetData['y'][idx]['data']

                // subtract the measured (physics ready) bpm offsets from the fit ready data
                const bpmNamesX = Object.keys(bpmReadingX);
                const bpmNamesY = Object.keys(bpmReadingY);
                const effectOfExcitationX = bpmNamesX.map(bpmName => bpmReadingX[bpmName].value)
                const effectOfExcitationXRms = bpmNamesX.map(bpmName => bpmReadingX[bpmName].rms)
                const effectOfExcitationY = bpmNamesY.map(bpmName => bpmReadingY[bpmName].value)
                const effectOfExcitationYRms = bpmNamesY.map(bpmName => bpmReadingY[bpmName].rms)

                // Extract the necessary data from the fetched estimated angles data
                // these are constant for all excitations
                const analyzedPerMagnet = Object.values(estimatedAnglesFetched.per_magnet).find(magnet => magnet.name === magnetName);
                const xEquivalentAngle = analyzedPerMagnet['x']['equivalent_angle']['value']
                const yEquivalentAngle = analyzedPerMagnet['y']['equivalent_angle']['value']
                const xEquivalentAngleStd = analyzedPerMagnet['x']['equivalent_angle']['std']
                const yEquivalentAngleStd = analyzedPerMagnet['y']['equivalent_angle']['std']
                const xKickStrength = analyzedPerMagnet['x']['orbit']['kick_strength']
                const yKickStrength = analyzedPerMagnet['y']['orbit']['kick_strength']

                const xOrbit = analyzedPerMagnet['x']['orbit']['delta']
                const yOrbit = analyzedPerMagnet['y']['orbit']['delta']
                const xOrbitAtBpm = bpmNamesX.map(bpmName => xOrbit[bpmName]);
                const yOrbitAtBpm = bpmNamesX.map(bpmName => yOrbit[bpmName]);
                const xBpmOffsets = bpmNamesX.map(bpmName => analyzedPerMagnet.x.bpm_offsets[bpmName].value);
                const yBpmOffsets = bpmNamesX.map(bpmName => analyzedPerMagnet.y.bpm_offsets[bpmName].value);
                const xBpmOffsetsStd = bpmNamesX.map(bpmName => analyzedPerMagnet.x.bpm_offsets[bpmName].std);
                const yBpmOffsetsStd = bpmNamesX.map(bpmName => analyzedPerMagnet.y.bpm_offsets[bpmName].std);

                const xOrbitScale = excitation / xKickStrength
                const yOrbitScale = excitation / yKickStrength
                const xExpectedDiff = xOrbitAtBpm.map(v => v * xOrbitScale * xEquivalentAngle)
                const xExpectedDiffStd = xOrbitAtBpm.map(v => v * xOrbitScale * Math.abs(xEquivalentAngleStd))
                const yExpectedDiff = yOrbitAtBpm.map(v => v * yOrbitScale * yEquivalentAngle)
                const yExpectedDiffStd = yOrbitAtBpm.map(v => v * yOrbitScale * Math.abs(yEquivalentAngleStd))

                const diffX = effectOfExcitationX.map((valueA, indexInA) => valueA - xBpmOffsets[indexInA])
                const diffY = effectOfExcitationY.map((valueA, indexInA) => valueA - yBpmOffsets[indexInA])

                const diffXErrBar = effectOfExcitationXRms.map((valueA, indexInA) => valueA + xBpmOffsetsStd[indexInA])
                const diffYErrBar = effectOfExcitationYRms.map((valueA, indexInA) => valueA + yBpmOffsetsStd[indexInA])

                // Calculate xDifference and yDifference
                const xDifference = diffX.map((value, index) => value - xExpectedDiff[index]);
                const yDifference = diffY.map((value, index) => value - yExpectedDiff[index]);

                // create the data for the fit estimate

                console.log( step , excitation, xEquivalentAngle )
                // Create traces for x and y BPM offsets as separate lines
                const label = '(step: ' + step + 'dI: ' + excitation + ')'
                console.log("label", label)
                const xDiffLine = {
                    // should be substituted by s (longitudinal length)
                    x: bpmNamesX,
                    y: diffX,
                    mode: 'lines+markers',
                    name: 'x: bpm measured - fit [m] ' + label,
                    type: 'scatter',
                    // should automatically select a different color for each excitation
                    line: {color: 'orange'},
                };

                const xExpectedDiffLine = {
                    x: bpmNamesX,
                    y: xExpectedDiff,
                    mode: 'lines+markers',
                    name: 'x: equivalent kick [m] ' + label,
                    type: 'scatter',
                    // the color here should match to the one of the corresponding xDiffline
                    line: {color: 'blue'},
                };
                const xDifferenceExpectedActual = {
                    x: bpmNamesX,
                    y: xDifference,
                    mode: 'lines+markers',
                    name: 'x: difference actual vs expected [m] ' + label,
                    type: 'scatter',
                    // the color here should match to the one of the corresponding xDiffline
                    line: {color: 'blue'},
                };
                const yDiffLine = {
                    // should be substituted by s (longitudinal length)
                    x: bpmNamesY,
                    y: diffY,
                    mode: 'lines+markers',
                    name: 'y: bpm measured - fit [m] ' + label,
                    type: 'scatter',
                    // should automatically select a different color for each excitation
                    line: {color: 'orange'},
                };

                const yExpectedDiffLine = {
                    x: bpmNamesY,
                    y: yExpectedDiff,
                    mode: 'lines+markers',
                    name: 'y: equivalent kick [m] ' + label,
                    type: 'scatter',
                    // the color here should match to the one of the corresponding xDiffline
                    line: {color: 'blue'},
                };

                const yDifferenceExpectedActual = {
                    x: bpmNamesY,
                    y: yDifference,
                    mode: 'lines+markers',
                    name: 'y: difference actual vs expected [m] ' + label,
                    type: 'scatter',
                    // the color here should match to the one of the corresponding xDiffline
                    line: {color: 'blue'},
                };

                // Push the traces to the traces array
                tracesX.push(xDiffLine, xExpectedDiffLine);
                tracesY.push(yDiffLine, yExpectedDiffLine);
                tracesXDiff.push(xDifferenceExpectedActual)
                tracesYDiff.push(yDifferenceExpectedActual)
            });
            const layout = {
                title: magnetName + ': effect of excitations',
                xaxis: {title: 'bpm names'},
                yaxis: {title: 'bpm offset diff: measured - fit'},
                barmode: 'group', // To group the bars for each magnet
            };

            const selectedMagnet = Object.values(estimatedAnglesFetched.per_magnet).find(magnet => magnet.name === magnetName);

            // Extract BPM names and scaled BPM offsets for the x and y planes
            const bpmNames = Object.keys(selectedMagnet.x.bpm_offsets);
            const bpmOffsetsX = bpmNames.map(bpmName => selectedMagnet.x.bpm_offsets[bpmName].value);
            const bpmOffsetsY = bpmNames.map(bpmName => selectedMagnet.y.bpm_offsets[bpmName].value);

            // Create traces for x and y BPM offsets as separate lines
            const xBpmOffsetsTrace = {
                x: bpmNames,
                y: bpmOffsetsX,
                mode: 'lines+markers',
                name: 'x: BPM offsets [mm]',
                line: {color: 'red'}, // Red color
            };

            const yBpmOffsetsTrace = {
                x: bpmNames,
                y: bpmOffsetsY,
                mode: 'lines+markers',
                name: 'y: BPM offsets [mm]',
                line: {color: 'blue'}, // Blue color1.1784783720862578e-11
            };
            // Create the layout for the plot
            const layoutX = {
                title: 'BPM Offsets for X and Y Planes ' + magnetName,
                xaxis: {title: 'BPM Name'},
                yaxis: {title: 'Offset Value'},
            };

            // Combine the traces
            const data3 = [xBpmOffsetsTrace, yBpmOffsetsTrace];
            // Create the plot
            Plotly.newPlot('plot1', tracesX, layout);
            Plotly.newPlot('plot2', tracesXDiff, layout);
            Plotly.newPlot('plot3', tracesY, layout);
            Plotly.newPlot('plot4', tracesYDiff, layout);
            Plotly.newPlot('plot5', data3, layoutX);
        }
    }