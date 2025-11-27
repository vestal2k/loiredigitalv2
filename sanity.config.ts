import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemas } from './sanity/schemas'

export default defineConfig({
  name: 'default',
  title: 'Loire Digital',

  projectId: 'your-project-id', // À remplacer après création du projet
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemas,
  },
})
