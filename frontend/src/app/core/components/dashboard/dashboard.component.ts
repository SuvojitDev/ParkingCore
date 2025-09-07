import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { finalize, forkJoin } from 'rxjs';
import { ParkingService } from '../../services/parking.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { PaymentService } from '../../services/payment.service';

interface PaymentRequest {
  bookingId: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  nameOnCard: string;
}

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
  searchQuery: string = '';
  isResetPasswordModalOpen: boolean = false;
  resetPasswordForm!: FormGroup;
  isChangePasswordModalOpen: boolean = false;
  changePasswordForm!: FormGroup;
  managers: any[] = [];
  parkingSlots: any[] = [];
  vehicleTypes = [
    { value: 'Car', label: 'Car' },
    { value: 'Bike', label: 'Bike' },
    { value: 'Truck', label: 'Truck' },
    { value: 'Bus', label: 'Bus' },
    { value: 'Other', label: 'Other' }
  ];
  isBookingModalOpen: boolean = false;
  isEditMode: boolean = false;
  isPaymentModalOpen: boolean = false;
  currentBookingForPayment: any = null;
  paymentForm!: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService,
    private parkingService: ParkingService,
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    // console.log('DashboardComponent initialized');
    const role = this.authService.getRole();
    // console.log('User role:', role);
    this.userRole = role || '';
    if (role === 'Admin') {
      this.loadAdminData();
      this.loadParkingSlots();
      this.loadBookings();
      this.createUser();
      this.createRoleForm();
      this.createParkingForm();
      this.createBookingForm();
      this.createResetPasswordForm();
      this.createChangePasswordForm();
    } else if (role === 'Manager') {
      console.log('Manager dashboard loaded');
      this.createBookingForm();
      this.createChangePasswordForm();
      this.loadBookings();
    } else if (role === 'Customer') {
      console.log('Customer dashboard loaded');
      this.createBookingForm();
      this.createChangePasswordForm();
      this.loadBookings();
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
        // console.log('Admin data loaded:', { users, slots, bookings });
      });
  }

  openParkingModal(): void {
    this.isParkingCreateModalOpen = true;
    this.parkingForm.reset();
    this.getManagers();
  }

  getManagers(): void {
    this.dataLoaded = true;
    this.adminService
      .getManagers()
      .pipe(finalize(() => this.dataLoaded = false))
      .subscribe({
        next: (res) => {
          console.log('Managers fetched:', res);
          this.managers = res;
        },
        error: (err) => {
          console.error('Error fetching managers:', err);
          this.toastr.error('Failed to load managers');
        }
      });
  }

  closeParkingModal(): void {
    this.isParkingCreateModalOpen = false;
  }

  createParkingForm(): void {
    this.parkingForm = this.fb.group({
      code: ['', [Validators.required]],
      location: ['', [Validators.required]],
      managerId: ['', [Validators.required]],
      type: ['', [Validators.required]],
      pricePerHour: ['', [Validators.required, Validators.min(0)]]
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
    this.getManagers();
    this.currentParkingSlot = slot?._id;
    this.parkingForm.patchValue({
      code: slot.code,
      location: slot.location,
      status: slot.status,
      type: slot.type,
      pricePerHour: slot.pricePerHour,
      managerId: slot.managerId._id,
    });
  }

  closeUpdateModal(): void {
    this.isParkingUpdateModalOpen = false;
  }

  updateParking(): void {
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
    // console.log('Editing user:', user);
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
    this.loadParkingSlotsForDropdown();
  }

  loadParkingSlotsForDropdown(): void {
    this.parkingService.getParkingSlotsDetails().subscribe({
      next: (res) => {
        // console.log('Parking slots fetched:', res);
        this.parkingSlots = res;
        this.toastr.success('Parking slots loaded');
      },
      error: (err) => {
        console.error('Error fetching parking slots:', err);
        this.toastr.error('Failed to load parking slots');
      }
    });
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
      this.bookingService.createBooking(this.bookingForm.value)
        .pipe(finalize(() => this.dataLoaded = false))
        .subscribe(() => {
          this.loadBookings();
          this.bookingForm.reset();
          this.closeCreateBookingModal();
          this.closeBookingModal();
          this.toastr.success('Booking created successfully');
        });
    }
  }

  openEditBookingModal(booking: any): void {
    console.log('Editing booking:', booking);
    this.isBookingUpdateModalOpen = true;

    this.bookingForm.patchValue({
      parkingId: booking.parkingId._id,
      startTime: moment.parseZone(booking.startTime).format('YYYY-MM-DDTHH:mm'),
      endTime: moment.parseZone(booking.endTime).format('YYYY-MM-DDTHH:mm')
    });

    this.currentUserId = booking._id;
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

  formatDateTime(date: string): string {
    return moment.parseZone(date).format('DD-MM-YYYY hh:mm A');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    console.log('Logged out');
  }

  searchParking(): void {
    const query = this.searchQuery.trim();

    if (!query) {
      // If empty, reload all slots
      this.loadParkingSlots();
      return;
    }

    this.parkingService.searchParking(query).subscribe(results => {
      this.allParkingSlots = results;
      console.log('Search results:', results);
    });
  }


  clearSearch(): void {
    this.searchQuery = '';
    this.loadParkingSlots(); // reload all slots
  }

  openProfileSettings() {
    this.isResetPasswordModalOpen = true;
    const tokenData = sessionStorage.getItem('token');
    console.log('token:', tokenData);
    this.resetPasswordForm.patchValue({ token: tokenData });
  }

  closeProfileSettings() {
    this.isResetPasswordModalOpen = false;
  }

  createResetPasswordForm() {
    this.resetPasswordForm = this.fb.group({
      token: [''],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submitResetPassword(): void {
    if (this.resetPasswordForm.valid) {
      const token = sessionStorage.getItem('token'); // must exist
      if (!token) {
        this.toastr.error('Reset token not found!');
        return;
      }

      const password = this.resetPasswordForm.value.password;

      this.authService.resetPassword(token, password).subscribe({
        next: () => {
          this.toastr.success('Password reset successful');
          this.isResetPasswordModalOpen = false;
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to reset password');
        }
      });
    }
  }

  openChangePasswordModal() {
    this.isChangePasswordModalOpen = true;
    this.changePasswordForm.reset();
  }

  closeChangePasswordModal() {
    this.isChangePasswordModalOpen = false;
  }


  createChangePasswordForm() {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submitChangePassword() {
    if (this.changePasswordForm.valid) {
      const { currentPassword, newPassword } = this.changePasswordForm.value;
      this.authService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.toastr.success('Password changed successfully');
          this.closeChangePasswordModal();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error(err?.error?.message || 'Failed to change password');
        }
      });
    }
  }

  openBookingModal() {
    this.isBookingModalOpen = true;
    this.bookingForm.reset();
    this.loadParkingSlotsForDropdown();
  }

  closeBookingModal() {
    this.isBookingModalOpen = false;
    this.bookingForm.reset();
  }

  openPaymentModal(booking: any): void {
    this.currentBookingForPayment = booking;
    this.isPaymentModalOpen = true;
    this.createPaymentForm();
    this.paymentForm.reset();
  }

  closePaymentModal(): void {
    this.isPaymentModalOpen = false;
    this.currentBookingForPayment = null;
  }

  createPaymentForm(): void {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      expiry: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/?([0-9]{2})$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      nameOnCard: ['', [Validators.required]]
    });
  }

  submitPayment(): void {
    if (this.paymentForm.invalid || !this.currentBookingForPayment) {
      this.toastr.error('Please fill in all card details correctly.');
      return;
    }

    const formValues = this.paymentForm.value;

    const payload: PaymentRequest = {
      bookingId: this.currentBookingForPayment._id,
      cardNumber: formValues.cardNumber,
      expiry: formValues.expiry,
      cvv: formValues.cvv,
      nameOnCard: formValues.nameOnCard
    };

    this.paymentService.processPayment(payload).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message || 'Payment successful!');
        this.closePaymentModal();
        this.loadBookings(); // Reload bookings to reflect the 'paid' status
        this.toastr.success(res.message);
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error(err?.error?.message || 'Payment failed. Please try again.');
      }
    });
  }

  updateBookingStatus(bookingId: string, newStatus: 'completed' | 'cancelled'): void {
    // Assuming your bookingService has a method to update the status
    this.bookingService.updateBookingStatus(bookingId, newStatus).subscribe({
      next: () => {
        this.toastr.success(`Booking status updated to ${newStatus}`);
        this.loadBookings(); // Reload the list to show the change
      },
      error: (err) => {
        this.toastr.error('Failed to update booking status');
        console.error(err);
      }
    });
  }

  ngOnDestroy(): void {
    console.log('DashboardComponent destroyed');
  }
}