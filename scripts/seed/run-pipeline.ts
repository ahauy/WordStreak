import { runStage1 } from './01-import';
import { runStage2 } from './02-normalize';
import { runStage3 } from './03-enrich';
import { runStage4 } from './04-validate';
import { runReviewExport } from './05-review-export';
import { runStage6 } from './06-build-decks';
import { runStage7 } from './07-publish';

export async function runPipeline() {
  console.log('====================================================');
  console.log('🚀 WordStreak Content Enrichment Pipeline (US-LIB-01)');
  console.log('====================================================');

  const startTime = Date.now();

  try {
    console.log('\n[Stage 1/7] Ingesting Raw Vocabulary CSVs...');
    await runStage1();

    console.log('\n[Stage 2/7] Normalizing, Tiering (T1/T2/T3) & Cross-Deduplicating...');
    await runStage2();

    console.log('\n[Stage 3/7] Resilient Batch Enrichment via Gemini...');
    await runStage3();

    console.log('\n[Stage 4/7] Quality Validation & Rules Audit...');
    const report = await runStage4();

    if (report.flaggedCount > 0) {
      console.log(`\n[Stage 5/7] Flagged items detected (${report.flaggedCount}). Exporting review CSV...`);
      await runReviewExport();
    } else {
      console.log('\n[Stage 5/7] 100% words passed validation. Skipping manual review export.');
    }

    console.log('\n[Stage 6/7] Partitioning & Packaging 25-Word Decks with SEO Slugs...');
    await runStage6();

    console.log('\n[Stage 7/7] Publishing to GlobalDictionaryCache & Exporting Starter Library Artifact...');
    const result = await runStage7();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n====================================================');
    console.log(`🎉 Pipeline Execution Completed Successfully in ${elapsed}s!`);
    console.log(`📊 Output Artifact: ${result.artifactPath}`);
    console.log(`📚 Decks Published: ${result.totalDecks} (${result.totalCards} cards)`);
    console.log('====================================================');
  } catch (error: any) {
    console.error('\n❌ Pipeline execution aborted due to error:', error.message || error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runPipeline();
}
