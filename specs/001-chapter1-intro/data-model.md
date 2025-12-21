# Data Model for Chapter 1: Introduction to Physical AI

## Content Entities

### Chapter
- **title**: string - "Introduction to Physical AI"
- **description**: string - Brief overview of the chapter content
- **sections**: array of Section objects - Ordered list of sections in the chapter
- **frontmatter**: object - Docusaurus metadata (title, description, etc.)

### Section
- **id**: string - Unique identifier for the section
- **title**: string - Section title
- **content**: string - Markdown/MDX content for the section
- **diagrams**: array of Diagram objects - Associated diagrams for the section
- **references**: array of Reference objects - External links and citations

### Diagram
- **type**: string - Diagram type (e.g., "mermaid", "flowchart", "sequence")
- **code**: string - Source code for the diagram (Mermaid syntax)
- **caption**: string - Description of the diagram
- **position**: string - Where the diagram appears relative to content

### Reference
- **url**: string - Full URL to external resource
- **title**: string - Descriptive title for the link
- **type**: string - Type of reference (e.g., "documentation", "research", "example")

## Validation Rules
- Each Section must have a unique title within the Chapter
- All URLs in References must be valid and accessible
- Diagram code must follow proper syntax for the specified type
- Content must follow Markdown/MDX syntax standards

## Relationships
- Chapter contains multiple Sections
- Section contains multiple Diagrams and References
- Content entities link to external References