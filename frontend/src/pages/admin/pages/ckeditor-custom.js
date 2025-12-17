// src/utils/ckeditor-custom.js
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic'

// Core plugins
import { Alignment } from '@ckeditor/ckeditor5-alignment'
import { Bold, Italic, Strikethrough, Underline } from '@ckeditor/ckeditor5-basic-styles'
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote'
import { Essentials } from '@ckeditor/ckeditor5-essentials'
import { FontBackgroundColor, FontColor } from '@ckeditor/ckeditor5-font'
import { Heading } from '@ckeditor/ckeditor5-heading'
import { Link } from '@ckeditor/ckeditor5-link'
import { List } from '@ckeditor/ckeditor5-list'
import { Paragraph } from '@ckeditor/ckeditor5-paragraph'
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table'
import { Undo } from '@ckeditor/ckeditor5-undo'

export class CustomEditor extends ClassicEditor { }

// Plugins array
CustomEditor.builtinPlugins = [
	Essentials,
	Paragraph,
	Heading,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Alignment,
	FontColor,
	FontBackgroundColor,
	List,
	Link,
	BlockQuote,
	Table,
	TableToolbar,
	Undo
]

// Default konfiguratsiya
CustomEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'underline',
			'strikethrough',
			'|',
			'fontColor',
			'fontBackgroundColor',
			'|',
			'alignment',
			'|',
			'bulletedList',
			'numberedList',
			'|',
			'link',
			'blockQuote',
			'insertTable',
			'|',
			'undo',
			'redo'
		]
	},
	language: 'en',
	alignment: {
		options: ['left', 'center', 'right', 'justify']
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	},
	licenseKey: '',
}

export default CustomEditor