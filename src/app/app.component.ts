import { Component } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

interface Users {
  id: number;
  name: string;
  email: string;
  role: string;
  disabled: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'HireQuotient_Assignment';
  User: Users[] = [];
  checked = false;
  loading = false;
  indeterminate = false;
  editId: number | null = null;
  listOfCurrentPageUsers: readonly Users[] = [];
  setOfCheckedId = new Set<number>();
  listOfUsers: readonly Users[] = [];
  searchUser!: string | '';
  searchValue = '';
  visible = false;
  listOfDisplayUser: Users[] = [];
  filterRole = [
    { text: 'Member', value: 'member' },
    { text: 'Admin', value: 'admin' }
  ];

  ngOnInit(): void {
    this.getUsers();
    
  }

  constructor(private nzMessageService: NzMessageService){
    
  }
  

  async getUsers() {
    try {
      const response = await fetch(
        'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json'
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        this.User = data;

        this.User.forEach((user, index) => {
          // user.disabled = index  === 0;
        });

        console.log(this.User);
      } else {
        throw new Error('Invalid data format. Expected an array.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    this.listOfDisplayUser = [...this.User];
    console.log("listOfDisplayUser=> ", this.listOfDisplayUser)

    
  }

  startEdit(id: number): void {
    this.editId = id;
  }

  stopEdit(): void {
    this.editId = null;
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
    console.log('this.setOfCheckedId => ', this.setOfCheckedId);
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageUsers.filter(
      ({ disabled }) => !disabled
    );
    this.checked = listOfEnabledData.every(({ id }) =>
      this.setOfCheckedId.has(id)
    );
    this.indeterminate =
      listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) &&
      !this.checked;
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    console.log('checked => ', checked);
    this.listOfCurrentPageUsers?.forEach((item) =>
      this.updateCheckedSet(item.id, checked)
    );
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly Users[]): void {
    this.listOfCurrentPageUsers = $event;
    this.refreshCheckedStatus();
  }

  deleteUser(idToDelete: number): void {
    this.User = this.User?.filter((user) => user.id !== idToDelete);
    this.listOfDisplayUser= [...this.User];
  }

  deleteSelectedUsers() {
    this.setOfCheckedId?.forEach((item) => this.deleteUser(item));
    this.listOfDisplayUser= [...this.User];
  }

  

  reset(): void {
    this.searchValue = '';
    this.search();
  }

  search(): void {
    this.visible = false;  
    const lowercaseSearchUser = this.searchUser.toLowerCase();
    this.listOfDisplayUser = this.User?.filter(
      (item: Users) => item.name.toLowerCase().indexOf(lowercaseSearchUser) !== -1
    );
  }
    
  cancel(): void {
    this.nzMessageService.info('click cancel');
  }
}
