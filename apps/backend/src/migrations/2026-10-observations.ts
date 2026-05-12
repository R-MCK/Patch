type DbRun = (sql: string, params?: readonly unknown[]) => Promise<unknown>
type DbGet = <T = Record<string, unknown>>(sql: string, params?: readonly unknown[]) => Promise<T | undefined>

export async function migrateLegacyNotesAndPhotosToObservations(
  dbRun: DbRun,
  dbGet: DbGet,
): Promise<void> {
  const notesTable = await dbGet<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='notes'",
  )
  const photosTable = await dbGet<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='photos'",
  )

  if (!notesTable && !photosTable) {
    return
  }

  await dbRun('BEGIN TRANSACTION')
  try {
    if (notesTable) {
      await dbRun(`
        INSERT OR IGNORE INTO observations (
          id,
          user_id,
          observation_type,
          text_content,
          plant_id,
          observed_at,
          created_at,
          updated_at
        )
        SELECT
          id,
          user_id,
          'textNote',
          CASE
            WHEN title IS NOT NULL AND trim(title) <> ''
              THEN trim(title) || char(10) || char(10) || content
            ELSE content
          END,
          plant_id,
          created_at,
          created_at,
          updated_at
        FROM notes
      `)
    }

    if (photosTable) {
      await dbRun(`
        INSERT OR IGNORE INTO observations (
          id,
          user_id,
          observation_type,
          text_content,
          image_data,
          thumbnail_data,
          plant_id,
          observed_at,
          created_at,
          updated_at
        )
        SELECT
          id,
          user_id,
          'photo',
          caption,
          image_data,
          thumbnail_data,
          plant_id,
          COALESCE(captured_at, created_at),
          created_at,
          updated_at
        FROM photos
      `)
    }

    if (notesTable) {
      await dbRun('DROP TABLE notes')
    }
    if (photosTable) {
      await dbRun('DROP TABLE photos')
    }

    await dbRun('COMMIT')
  } catch (error) {
    await dbRun('ROLLBACK')
    throw error
  }
}
