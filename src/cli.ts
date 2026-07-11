#!/usr/bin/env ts-node
import { Command } from 'commander';
import * as path from 'path';
import { FractalLogEntry, FractalParams } from './core/domain/types';
import { composeNodeServices } from './composition/NodeComposition';
import { FractalLogRepository } from './adapters/node/FractalLogRepository';
import { LoggerService } from './adapters/node/LoggerService';

const OUTPUT_DIR = path.resolve(process.cwd(), 'output');

const program = new Command();

program
  .name('fractal-tree')
  .description('Generate fractal trees from the command line with structured logging.')
  .version('2.0.0');

program
  .command('generate', { isDefault: true })
  .description('Generate a fractal tree PNG and log the parameters')
  .option('--depth <n>', 'Recursion depth 1-12 (default: 7)', parseFloat)
  .option('--angle <deg>', 'Branch angle in degrees 1-90 (default: 30)', parseFloat)
  .option('--length-factor <f>', 'Branch length multiplier 0.1-0.9 (default: 0.7)', parseFloat)
  .option('--trunk-length <px>', 'Trunk length in pixels 10-500 (default: 120)', parseFloat)
  .option('--line-width <px>', 'Initial line width 1-20 (default: 4)', parseFloat)
  .option('--randomness <f>', 'Jitter factor 0-1 (default: 0)', parseFloat)
  .option('--speed <ms>', 'Delay between branches in ms, 0=instant (default: 0)', parseFloat)
  .option('--trunk-color <hex>', 'Trunk color hex (default: #8B4513)')
  .option('--leaf-color <hex>', 'Leaf color hex (default: #228B22)')
  .option('--accent-color <hex>', 'Accent color hex (default: #FF69B4)')
  .option('--show-accent', 'Enable accent branches (default: false)', false)
  .option('--output <path>', 'Output PNG file path (default: output/fractal-<timestamp>.png)')
  .action(async (options) => {
    const { fractalService, rendererService, loggerService, configService, speedControlService } =
      composeNodeServices();

    const partialParams: Partial<FractalParams> = {};
    if (options.depth !== undefined) partialParams.depth = options.depth;
    if (options.angle !== undefined) partialParams.angle = options.angle;
    if (options.lengthFactor !== undefined) partialParams.lengthFactor = options.lengthFactor;
    if (options.trunkLength !== undefined) partialParams.trunkLength = options.trunkLength;
    if (options.lineWidth !== undefined) partialParams.lineWidth = options.lineWidth;
    if (options.randomness !== undefined) partialParams.randomness = options.randomness;
    if (options.speed !== undefined) partialParams.animationSpeed = options.speed;
    if (options.showAccent !== undefined) partialParams.showAccent = options.showAccent;

    if (options.trunkColor || options.leafColor || options.accentColor) {
      const defaults = configService.getDefaults();
      partialParams.colors = {
        trunk: options.trunkColor ?? defaults.colors.trunk,
        leaf: options.leafColor ?? defaults.colors.leaf,
        accent: options.accentColor ?? defaults.colors.accent,
      };
    }

    const params = configService.validate(partialParams);

    if (params.animationSpeed > 0) {
      speedControlService.setDelay(params.animationSpeed);
    }

    console.log('\nGenerating fractal tree...');
    console.log(`  Depth:        ${params.depth}`);
    console.log(`  Angle:        ${params.angle}°`);
    console.log(`  Length factor:${params.lengthFactor}`);
    console.log(`  Trunk length: ${params.trunkLength}px`);
    console.log(
      `  Speed:        ${params.animationSpeed === 0 ? 'instant' : `${params.animationSpeed}ms/branch`}`
    );

    const result = await fractalService.generate(params);

    const timestamp = new Date().toISOString();
    const outputPath = options.output
      ? path.resolve(options.output)
      : path.join(OUTPUT_DIR, `fractal-${timestamp.replace(/[:.]/g, '-')}.png`);

    await rendererService.save(outputPath);
    result.outputPath = outputPath;

    const logEntry: FractalLogEntry = {
      timestamp,
      params,
      generationTimeMs: result.generationTimeMs,
      outputPath,
      totalBranchesDrawn: result.totalBranchesDrawn,
    };
    await loggerService.log(logEntry);

    console.log(`\nDone in ${result.generationTimeMs}ms`);
    console.log(`  Branches drawn: ${result.totalBranchesDrawn}`);
    console.log(`  Output PNG:     ${outputPath}`);
    console.log(`  Log entry saved to SQLite and logs/`);
  });

program
  .command('history')
  .description('Show recent fractal generation log entries')
  .option('-n, --limit <n>', 'Number of entries to show (default: 10)', parseFloat)
  .action(async (options) => {
    const repository = new FractalLogRepository();
    const loggerService = new LoggerService(repository);
    const limit = options.limit ?? 10;
    const entries = await loggerService.getRecent(limit);

    if (entries.length === 0) {
      console.log('No fractal generations logged yet.');
      return;
    }

    console.log(`\nLast ${entries.length} fractal generation(s):\n`);
    for (const entry of entries) {
      console.log(`  [${entry.id}] ${entry.timestamp}`);
      console.log(
        `       depth=${entry.params.depth}  angle=${entry.params.angle}°  speed=${entry.params.animationSpeed}ms`
      );
      console.log(`       branches=${entry.totalBranchesDrawn}  time=${entry.generationTimeMs}ms`);
      console.log(`       output: ${entry.outputPath}`);
      console.log();
    }
  });

program.parse(process.argv);
