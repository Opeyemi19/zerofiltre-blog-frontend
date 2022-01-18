import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';
import { Article, Tag } from '../article.model';
import { ArticleService } from '../article.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-article-entry-create',
  templateUrl: './article-entry-create.component.html',
  styleUrls: ['./article-entry-create.component.css']
})
export class ArticleEntryCreateComponent implements OnInit {

  @ViewChild('fileUpload', { static: false })
  fileUpload!: ElementRef;

  public form!: FormGroup;

  public activeTab: string = 'editor';
  public article!: Article
  public articleId!: number
  public articleTitle!: string
  public tagList!: Tag[]
  public selectedTags: Tag[] = []

  dropdownSettings = {};

  public tagListDrop = [
    { item_id: 1, item_text: 'java' },
    { item_id: 2, item_text: 'angular' },
    { item_id: 3, item_text: 'spring-boot' },
    { item_id: 4, item_text: 'html' },
    { item_id: 5, item_text: 'react' },
    { item_id: 6, item_text: 'sql' },
    { item_id: 7, item_text: 'graphql' },
    { item_id: 8, item_text: 'docker' },
    { item_id: 9, item_text: 'api' },
    { item_id: 10, item_text: 'rest' }
  ]

  public selectedTagsDrop = [
    // { item_id: 3, item_text: 'Pune' },
    // { item_id: 4, item_text: 'Navsari' }
  ]

  // markdown = `
  //   ## Markdown __rulez__!

  //   ### Syntax highlight
  //   \`\`\`ts
  //     const language = 'typescript';
  //   \`\`\`

  //   ### Ordered Lists
  //   1. bullet point
  //   2. Another bullet point

  //   ### Unordered list
  //   - Unordered bullet
  //   - Another unordered bullet

  //   ### Blockquote
  //   > Blockquote to the max

  //   \`\`\`js
  //     const language = 'javascript';
  //   \`\`\`

  //   \`\`\`java
  //     String language = "java";
  //   \`\`\`

  //   ### Inline code
  //  \`Inline code\`

  //   ### Links
  //   [google-link](https://google.com)

  //   ### Image
  //   ![Screenshot from 2021-11-04 09-32-25.png](https://images.ctfassets.net/hrltx12pl8hq/7yQR5uJhwEkRfjwMFJ7bUK/dc52a0913e8ff8b5c276177890eb0129/offset_comp_772626-opt.jpg?fit=fill&w=800&h=300)

  //   ### Embed Iframe
  //   <iframe src="https://www.youtube.com/embed/yz8x71BiGXg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
  //   </iframe>

  //   ### Divider
  //   ---
  //   `;

  constructor(
    private formuilder: FormBuilder,
    private articleService: ArticleService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  public setActiveTab(tabName: string): void {
    if (tabName === 'editor') this.activeTab = 'editor'
    if (tabName === 'preview') this.activeTab = 'preview'
    if (tabName === 'help') this.activeTab = 'help'
  }

  public getArticle(): void {
    this.articleService.getOneArticle(this.articleId).subscribe({
      next: (response: Article) => {
        this.article = response
        this.tagList = response.tags
        this.articleTitle = response.title!
        this.form.controls['title'].setValue(this.articleTitle)
        this.form.controls['id'].setValue(+this.articleId)
      },
      error: (error: HttpErrorResponse) => {
        console.log(error.message);
      }
    })
  }

  public selectTag(): void {
    console.log('SELECTTAG');
    if (!this.selectedTags.includes(this.form.controls['tags'].value)) {
      this.selectedTags.push(this.form.controls['tags'].value)
    }

    this.form.controls['tags'].setValue([...this.selectedTags])
  }

  public InitForm(): void {
    this.form = this.formuilder.group({
      id: [null],
      title: ['', [Validators.required]],
      thumbnail: ['https://www.ricoh-imaging.co.jp/english/products/q-s1/ex/img/ex-thumb-pic01.jpg', [Validators.required]],
      content: ['', [Validators.required]],
      tags: [[]]
    })
  }

  public saveArticle() {
    console.log(this.form.value);
    this.articleService.updateToSave(this.form.value).pipe(
      tap(() => this.router.navigateByUrl('/'))
    ).subscribe();
  }

  public publishArticle() {
    console.log(this.form.value);
    this.articleService.updateToPublish(this.form.value).pipe(
      tap(() => this.router.navigateByUrl('/'))
    ).subscribe();
  }

  public onClickFileUpload() {
    const fileInput = this.fileUpload.nativeElement;
    fileInput.click();

    // fileInput.onchange = () => {
    //   this.file = {
    //     data: fileInput.files[0],
    //     inProgress: false,
    //     progress: 0
    //   };
    //   this.fileUpload.nativeElement.value = '';
    //   this.uploadFile();
    // };    
  }

  public uploadFile() {

  }

  public removeFile() {
    if (this.form.controls['thumbnail'].value !== '') this.form.controls['thumbnail'].setValue('')
  }

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  ngOnInit(): void {
    this.articleId = this.route.snapshot.params.id
    this.getArticle()
    this.InitForm()

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Tout Sélectioner',
      unSelectAllText: 'Déselectioner tout',
      allowSearchFilter: true,
      searchPlaceholderText: "Rechercher",
      // itemsShowLimit: 3,
      // limitSelection: 3
    };
  }

}
