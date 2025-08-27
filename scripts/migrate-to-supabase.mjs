#!/usr/bin/env node

/**
 * Migration script to upload images and data to Supabase
 * Run with: node scripts/migrate-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
import dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables in .env.local')
  console.log('Make sure you have REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_SERVICE_KEY')
  process.exit(1)
}

// Use service key for admin operations during migration
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateImages() {
  console.log('🚀 Starting migration to Supabase...')

  // 1. Load images.json
  const imagesJsonPath = path.join(__dirname, '../src/images.json')
  const imagesData = JSON.parse(fs.readFileSync(imagesJsonPath, 'utf8'))
  console.log(`📋 Found ${imagesData.length} images in images.json`)

  // 2. Get the public game instance ID
  const { data: gameInstance, error: gameError } = await supabase
    .from('game_instances')
    .select('id')
    .eq('name', 'public')
    .single()

  if (gameError) {
    console.error('❌ Error finding public game instance:', gameError)
    process.exit(1)
  }

  console.log(`✅ Found public game instance with ID: ${gameInstance.id}`)

  // 3. Upload images and insert metadata
  const imagesDir = path.join(__dirname, '../public/images/game')
  let successCount = 0
  let errorCount = 0

  for (const imageInfo of imagesData) {
    const { image: filename, coordinates } = imageInfo
    const filePath = path.join(imagesDir, filename)

    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filename}`)
        errorCount++
        continue
      }

      // Upload to Supabase Storage
      const fileBuffer = fs.readFileSync(filePath)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('game-images')
        .upload(filename, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true // Overwrite if exists
        })

      if (uploadError) {
        console.error(`❌ Upload error for ${filename}:`, uploadError)
        errorCount++
        continue
      }

      // Insert image metadata
      const { data: imageData, error: insertError } = await supabase
        .from('images')
        .upsert({
          filename: filename,
          coordinates: coordinates,
          storage_path: uploadData.path,
          difficulty_level: 'normal' // Default for existing images
        }, { onConflict: 'filename' })
        .select()

      if (insertError) {
        console.error(`❌ Database insert error for ${filename}:`, insertError)
        errorCount++
        continue
      }

      // Link to public game instance
      const { error: linkError } = await supabase
        .from('game_instance_images')
        .upsert({
          game_instance_id: gameInstance.id,
          image_id: imageData[0].id
        }, { onConflict: 'game_instance_id,image_id' })

      if (linkError) {
        console.error(`❌ Game instance link error for ${filename}:`, linkError)
        errorCount++
        continue
      }

      console.log(`✅ Migrated: ${filename}`)
      successCount++

    } catch (error) {
      console.error(`❌ Unexpected error with ${filename}:`, error)
      errorCount++
    }
  }

  console.log('\n📊 Migration Summary:')
  console.log(`✅ Successfully migrated: ${successCount} images`)
  console.log(`❌ Errors: ${errorCount} images`)

  if (errorCount === 0) {
    console.log('🎉 Migration completed successfully!')
  } else {
    console.log('⚠️  Migration completed with some errors. Please review the log above.')
  }
}

// Run migration
migrateImages().catch(console.error)
