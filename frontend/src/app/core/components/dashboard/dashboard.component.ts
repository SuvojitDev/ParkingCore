import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { finalize, forkJoin } from 'rxjs';
import { ParkingService } from '../../services/parking.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalUsers: number = 0;
  totalManagers: number = 0
  totalCustomers: number = 0;
  totalBookings: number = 0;
  totalRevenue: number = 0;
  totalSlots: number = 0;
  userRole: string = '';
  allParkingSlots: any[] = [];
  isParkingCreateModalOpen: boolean = false;
  isParkingUpdateModalOpen: boolean = false;
  userCreateModalOpen: boolean = false;
  userEditModalOpen: boolean = false;
  modalMode: 'create' | 'update' = 'create';
  currentParkingSlot: any = {};
  allUsers: any[] = [];
  userForm!: FormGroup;
  dataLoaded: boolean = false;
  currentUserId: string | null = null;
  isRoleModalOpen: boolean = false;
  currentUserForRoleChange: any = null;
  roleForm!: FormGroup;
  parkingForm!: FormGroup;
  bookingForm!: FormGroup;
  isBookingCreateModalOpen: boolean = false;
  isBookingUpdateModalOpen: boolean = false;
  bookings: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private parkingService: ParkingService,
    private bookingService: BookingService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    console.log('DashboardComponent initialized');
    const role = this.authService.getRole();
    console.log('User role:', role);
    this.userRole = role || '';

    if (role === 'Admin') {
      this.loadAdminData();
      this.loadParkingSlots();
      this.loadBookings();
      this.createUser();
      this.createRoleForm();
      this.createParkingForm();
      this.createBookingForm();
    } else if (role === 'Manager') {
      this.loadManagerData();
    } else if (role === 'Customer') {
      this.loadCustomerData();
    }
  }

  loadAdminData() {
    forkJoin({
      users: this.adminService.getUsers(),
      slots: this.parkingService.getParkingSlots(),
      bookings: this.adminService.getAllBookings()
    })
      .subscribe(({ users, slots, bookings }) => {
        this.totalUsers = users.length;
        this.totalSlots = slots.length;
        this.totalBookings = bookings.length;
        this.allUsers = users;
        console.log('Admin data loaded:', { users, slots, bookings });
      });
  }

  loadManagerData(): void {
    console.log('Loading Manager data...');
    // Fetch and display Manager-specific data
  }

  loadCustomerData(): void {
    console.log('Loading Customer data...');
    // Fetch and display Customer-specific data
  }

  openParkingModal(): void {
    this.isParkingCreateModalOpen = true;
  }

  closeParkingModal(): void {
    this.isParkingCreateModalOpen = false;
  }

  createParkingForm(): void {
    this.parkingForm = this.fb.group({
      code: ['', [Validators.required]],
      location: ['', [Validators.required]],
      managerId: ['', [Validators.required]],
    });
  }

  saveParking(): void {
    this.dataLoaded = true;
    if (this.parkingForm.valid) {
      if (this.modalMode === 'create') {
        this.parkingService.createParking(this.parkingForm.value)
          .pipe(finalize(() => this.dataLoaded = false))
          .subscribe(() => {
            this.loadParkingSlots();
            this.closeParkingModal();
          });
      }
    }
  }

  openUpdateModal(slot: any): void {
    this.isParkingUpdateModalOpen = true;
    this.currentParkingSlot = slot?._id;
    this.parkingForm.patchValue({
      code: slot.code,
      location: slot.location,
      managerId: slot.managerId._id,
    });
  }

  closeUpdateModal(): void {
    this.isParkingUpdateModalOpen = false;
  }

  upateParking(): void {
    this.dataLoaded = true;
    if (this.currentParkingSlot) {
      const payload = { ...this.parkingForm.value };
      this.parkingService.updateParking(this.currentParkingSlot, payload)
        .pipe(finalize(() => this.dataLoaded = false))
        .subscribe(() => {
          this.loadParkingSlots();
          this.closeUpdateModal();
        });
    }
  }

  loadParkingSlots(): void {
    this.parkingService.getParkingSlots().subscribe(slots => {
      this.allParkingSlots = slots;
      this.totalSlots = slots.length;
    });
  }

  deleteParking(id: string): void {
    this.parkingService.deleteParking(id).subscribe(() => {
      this.loadParkingSlots();
    });
  }

  openUserModal() {
    this.userCreateModalOpen = true;
  }

  createUser() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Customer', [Validators.required]]
    });
  }

  saveUser() {
    this.dataLoaded = true;
    if (this.userForm.valid) {
      if (this.modalMode === 'create') {
        this.adminService.createUser(this.userForm.value)
          .pipe(finalize(() => this.dataLoaded = false))
          .subscribe(() => {
            this.loadAdminData();
            this.closeUserModal();
          });
      }
    }
  }

  closeUserModal() {
    this.userCreateModalOpen = false;
    this.userForm.reset();
  }

  openEditUserModal(user: any) {
    console.log('Editing user:', user);
    this.userEditModalOpen = true;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    this.currentUserId = user._id;
  }

  updateUser() {
    console.log('Updating user with ID:', this.currentUserId);
    this.dataLoaded = true;
    if (this.currentUserId) {
      const updateData = { ...this.userForm.value };
      this.adminService.updateUser(this.currentUserId, updateData)
        .pipe(finalize(() => this.dataLoaded = false))
        .subscribe(() => {
          this.loadAdminData();
          this.closeUpdateUserModal();
        });
    }
  }

  closeUpdateUserModal() {
    this.userEditModalOpen = false;
    this.userForm.reset();
  }


  deleteUser(id: string): void {
    this.adminService.deleteUser(id).subscribe(() => {
      this.loadAdminData();
    });
  }

  openRoleModal(user: any): void {
    this.currentUserForRoleChange = { ...user };
    this.roleForm.patchValue({ role: user.role });
    this.isRoleModalOpen = true;
  }

  closeRoleModal(): void {
    this.isRoleModalOpen = false;
    this.currentUserForRoleChange = null;
  }

  createRoleForm(): void {
    this.roleForm = this.fb.group({
      role: ['', [Validators.required]]
    });
  }

  updateRole(): void {
    if (this.currentUserForRoleChange && this.roleForm.valid) {
      const userId = this.currentUserForRoleChange._id;
      const newRole = this.roleForm.value.role;
      this.adminService.updateUserRole(userId, newRole).subscribe(() => {
        this.loadAdminData();
        this.closeRoleModal();
      });
    }
  }

  openCreateBookingModal(): void {
    this.isBookingCreateModalOpen = true;
  }

  closeCreateBookingModal(): void {
    this.isBookingCreateModalOpen = false;
  }
  openUpdateBookingModal(): void {
    this.isBookingUpdateModalOpen = true;
  }

  closeUpdateBookingModal(): void {
    this.isBookingUpdateModalOpen = false;
  }

  createBookingForm(): void {
    this.bookingForm = this.fb.group({
      parkingId: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  saveBooking(): void {
    this.dataLoaded = true;
    if (this.bookingForm.valid) {
      this.bookingForm.reset();
      this.closeCreateBookingModal();
    }
  }

  openEditBookingModal(): void {
    this.isBookingUpdateModalOpen = true;
  }

  updateBooking(): void {
    this.dataLoaded = true;
    if (this.bookingForm.valid) {
      this.bookingForm.reset();
      this.closeUpdateBookingModal();
    }
  }

  deleteBooking(id: string): void {
    this.bookingService.updateBookingStatus(id, 'cancelled').subscribe(() => {
      this.loadBookings();
    });
  }

  loadBookings() {
    this.bookingService.getBookings().subscribe({
      next: (res) => this.bookings = res,
      error: (err) => { }
    });
  }

  formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    console.log('Logged out');
  }

  ngOnDestroy(): void {
    console.log('DashboardComponent destroyed');
  }
}
